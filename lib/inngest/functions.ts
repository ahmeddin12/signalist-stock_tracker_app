import { inngest } from '@/lib/inngest/client'
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendWelcomeEmail, sendNewsSummaryEmail} from "@/lib/nodemailer";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.action";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import  { formatDateToday } from "@/lib/utils";

type User = { id: string; email: string; name: string };

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    {event: 'app/user.created'},
    async ({event, step}) =>{
        const userProfile = `
        - country: ${event.data.country}
        - Investment goals: ${event.data.investmentGoals}
        - Risk tolerance: ${event.data.riskTolerance}
        - Preferred industry: ${event.data.preferredIndustry}`

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({model: 'gemini-2.5-flash-lite'}),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {text: prompt}
                        ]
                    }]
            }

        })

        await step.run('send-welcome-email', async ()=> {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) ||'Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })
        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
         }

)


export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'send-daily-news-summary'},
    [ {event: 'app/send.daily.news'}, {cron: '0 12 * * *'}],

    async ({step}) => {
        // Step 1: fetch all users
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)
        if (!users || users.length === 0) return { success: true, message: 'No users found' };

        // Step 2: For each user, get watchlist symbols and fetch news (fallback to general). Max 6 per user.
        const perUserNews = await step.run('fetch-news-per-user', async () => {
            const results = await Promise.all(users.map(async (user) => {
                const symbols = await getWatchlistSymbolsByEmail(user.email);
                let news: MarketNewsArticle[] = [];
                try {
                    news = await getNews(symbols && symbols.length > 0 ? symbols : undefined);
                } catch {
                    news = [];
                }
                if (!news || news.length === 0) {
                    try {
                        news = await getNews();
                    } catch {
                        news = [];
                    }
                }
                return { user, news: (news || []).slice(0, 6) };
            }));
            return results;
        });

        // Step 3: Summarize news via AI
        const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

        for (const { user, news } of perUserNews) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(news, null, 2));

                const response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                    body: {
                        contents: [{ role: 'user', parts: [{ text: prompt }]}]
                    }
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.';

                userNewsSummaries.push({ user, newsContent });
            } catch (e) {
                console.error('Failed to summarize news for:', user.email, e);
                userNewsSummaries.push({ user, newsContent: null });
            }
        }

        // Step 4: Send the emails
        await step.run('send-daily-news-emails', async () => {

            const date = formatDateToday;
            const tasks = userNewsSummaries.map(async ({ user, newsContent }) => {
                if (!newsContent) return null;
                try {
                    await sendNewsSummaryEmail({ email: user.email, date, newsContent });
                    return { email: user.email, status: 'sent' as const };
                } catch (err) {
                    console.error('Failed to send news email to:', user.email, err);
                    return { email: user.email, status: 'failed' as const };
                }
            });

            const results = await Promise.all(tasks);
            return results;
        });

        return { success: true,  message: 'Daily news summary emails sent successfully' };
    })

