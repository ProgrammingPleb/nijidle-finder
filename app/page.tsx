import Logo from "@/public/SiteLogo.svg";
import Image from "next/image";
import { getAllLivers } from "./backend/data";
import { LiverSearch } from "./liver-search";

export default async function Home() {
    const livers = await getAllLivers();

    return (
        <div className="w-svw min-h-svh lg:h-svh lg:overflow-hidden p-4 flex flex-col">
            <div className="flex mb-4 w-full justify-center">
                <Image
                    src={Logo} alt="Nijidle Finder"
                    className="w-96 max-w-full h-auto"
                />
            </div>
            <LiverSearch livers={livers} />
        </div>
    );
}
