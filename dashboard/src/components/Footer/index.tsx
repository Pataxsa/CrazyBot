import logo from "../../assets/logo.webp";

function Footer() {
    return (
        <footer>
            <div className="bg-white py-4 border-t">
                <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">
                    <a href="/">
                        <div className="hidden md:flex items-center">
                            <img src={logo} alt="Logo" className="h-8" />
                        </div>
                    </a>

                    <div className="hidden md:flex space-x-6">
                        <a href="/#features" className=" hover:text-indigo-500 duration-100">
                            Features
                        </a>
                        <a href="/#about" className=" hover:text-indigo-500 duration-100">
                            About
                        </a>
                        <a href="/docs" className="hover:text-indigo-500 duration-100">
                            Docs
                        </a>
                    </div>
                </div>

                <a href="/">
                    <div className="md:hidden flex items-center justify-center">
                        <img src="./src/assets/logo.webp" alt="Logo" className="h-8" />
                    </div>
                </a>

                <div className="md:hidden text-center mt-4 space-y-4">
                    <a href="#" className="hover:text-indigo-500 block">
                        Home
                    </a>
                    <a href="#" className=" hover:text-indigo-500 block">
                        About
                    </a>
                    <a href="#" className=" hover:text-indigo-500 block">
                        Contact
                    </a>
                </div>
            </div>

            <div className="border-t py-4 flex items-center justify-center text-xs">
                Copyright © 2025 Crazy bot. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
