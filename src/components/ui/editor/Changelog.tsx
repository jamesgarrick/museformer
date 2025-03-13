import React from "react";

const versions = [
  {
    version: "0.1.0",
    date: "2025-03-01",
    notes: [
      "Initial alpha release",
      "Basic UI implemented",
      "Core features in place",
    ],
  },
  {
    version: "0.1.1",
    date: "2025-03-05",
    notes: ["Bug fixes", "Performance improvements"],
  },
  // Add more versions as needed...
];

export const Changelog = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-foreground">
        Version History
      </h2>
      {versions.map((entry) => (
        <div key={entry.version} className="mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg text-foreground">
              {entry.version}
            </span>
            <span className="text-sm text-foreground">{entry.date}</span>
          </div>
          <ul className="list-disc ml-6 mt-2">
            {entry.notes.map((note, idx) => (
              <li key={idx} className="text-foreground">
                {note}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
