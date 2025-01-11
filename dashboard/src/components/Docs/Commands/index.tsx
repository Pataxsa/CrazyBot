import { useState } from "react";

import { CaretDown } from "@phosphor-icons/react";

const Accordion = (prop: CommandProps) => {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);

  return (
    <div className="max-w-lg w-full z-50 bg-white shadow-lg rounded-lg overflow-hidden mb-4">
      <button
        onClick={toggle}
        className="w-full px-6 py-4 text-left bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-300 focus:outline-none flex items-center justify-between"
      >
        <h2 className="font-semibold text-lg">
          {prop.name.toLocaleLowerCase()}
        </h2>
        <span
          className={`transform transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <CaretDown />
        </span>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${open ? "max-h-screen px-2 py-2" : "max-h-0 px-2"}`}
      >
        <div>
          <div className="px-4 sm:px-0">
            <h3 className="text-base font-semibold text-gray-900">
              Parameters
            </h3>

            {prop.params && prop.params.length === 0 ? (
              <>None</>
            ) : (
              <div className="flex flex-col gap-5">
                {prop.params?.map((param: CommandPropsParam) => (
                  <div>
                    <strong>{param.name}</strong> {param.type}
                  </div>
                ))}
              </div>
            )}

            <p className="mt-1 max-w-2xl text-sm text-gray-500"></p>
          </div>
        </div>
      </div>
    </div>
  );
};

function Commands({ props }: { props: CommandProps[] }) {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen space-y-4 py-8">
      {props.map((prop: CommandProps) => (
        <Accordion key={prop.name} {...prop} />
      ))}
    </div>
  );
}

export default Commands;
