import Hero from "@/components/Docs/Hero";
import Commands from "@/components/Docs/Commands";

const commands: CommandProps[] = [
  {
    name: "ping",
  },
  {
    name: "bring",
    params: [
      {
        name: "users",
        type: "string",
        required: true,
      },
    ],
  },
  {
    name: "ping",
  },
];

function Docs() {
  return (
    <div>
      <Hero />
      <Commands props={commands} />
    </div>
  );
}

export default Docs;
