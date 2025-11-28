import Image from "next/image";
import Link from "next/link";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import {searchStocks} from "@/lib/actions/finnhub.actions";


const Header = async ({user}: {user: User}) => {

    const initialStocks = await searchStocks();
    return (
        <header className='sticky top-0 header'>
            <div className="container flex header-wrapper">
                <Link href="/">
                    <Image src="/assets/icons/logo.svg" alt="Signalist Logo" width={140} height={32} className="h-8 w-auto cursor-pointer"/>
                </Link>
                <nav className="hidden sm:block">
                    <NavItems initialStocks={initialStocks} />
                </nav>
                <UserDropdown initialStocks={initialStocks} user={user} />
            </div>
        </header>
    )
}
export default Header
