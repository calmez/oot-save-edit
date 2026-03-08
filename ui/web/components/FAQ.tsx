import { JSX } from "preact/jsx-runtime";

interface FAQItem {
  question: string;
  answer: JSX.Element;
}

const data: FAQItem[] = [
  {
    question: "What is the difference between SRM and SRA save files?",
    answer: (
      <p>
        SRM files are usually used by emulators like RetroArch. They include
        different save file formats in one compact file. SRA on the other hand
        is a format that just represents SRAM on an actual cartridge and is not
        only used by original cartridges, but also Everdrives.
      </p>
    ),
  },
  {
    question: "Can I use this tool on mobile devices?",
    answer: (
      <p>
        The web interface should work on mobile devices. You can also use
        bookmark functionality (i.e. on iOS) to keep the web application on your
        home screen.
      </p>
    ),
  },
  {
    question: "How do I contribute to this project?",
    answer: (
      <p>
        Contributions are welcome! You can contribute by reporting issues,
        suggesting improvements, or submitting pull requests on our{" "}
        <a
          href="https://github.com/calmez/oot-save-edit"
          className="text-gray-900 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>.
      </p>
    ),
  },
];

export function FAQ() {
  return (
    <div className="flex flex-col gap-2 pt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Frequently Asked Questions
      </h2>
      {data.map((item, index) => (
        <details key={index} className="space-y-4">
          <summary className="cursor-pointer text-lg font-semibold text-slate-900">
            {item.question}
          </summary>
          <div className="mt-4 space-y-4">
            <p>
              {item.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
