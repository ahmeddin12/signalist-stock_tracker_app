import {router} from "next/client";
import {signUpWithEmail} from "@/lib/actions/auth.actions";
import {toast} from "sonner";

const onSubmit = async (data: SignUpFormData) => {
    try {
        const result = await signUpWithEmail(data);
        if(result.success) router.push('/');
    } catch (e) {
        console.error(e);

        toast.error('Sign up failed', {
            description: e instanceof Error ? e.message : 'Failed to create an account.'
        })
    }
}