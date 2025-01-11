const people = [
    {
        name: "0BL1V10N",
        role: "Developer",
        imageUrl: "/profiles/axel.webp"
    },
    {
        name: "SkySkie",
        role: "Developer",
        imageUrl: "/profiles/dimitri.webp"
    },
    {
        name: "Mattéo",
        role: "Developer",
        imageUrl: "/profiles/matteo.webp"
    },
    {
        name: "Noam_C",
        role: "Developer",
        imageUrl: "/profiles/noam.webp"
    }
    // More people...
];

function Team() {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
                <div className="max-w-xl">
                    <h2 className="text-pretty text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
                        Meet the minds
                    </h2>
                    <p className="mt-6 text-lg/8 text-gray-600">
                        Young and dynamic, we built this tool to permit you to enhance your server with the bests
                        features available.
                    </p>
                </div>
                <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
                    {people.map(person => (
                        <li key={person.name}>
                            <div className="flex items-center gap-x-6">
                                <img alt="" src={person.imageUrl} className="size-16 rounded-full" />
                                <div>
                                    <h3 className="text-base/7 font-semibold tracking-tight text-gray-900">
                                        {person.name}
                                    </h3>
                                    <p className="text-sm/6 font-semibold text-indigo-600">{person.role}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Team;
