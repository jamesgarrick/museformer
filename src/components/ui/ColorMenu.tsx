import { ColorButton } from "./ColorButton";

type ColorMenuProps = {
  onColorSelect: (color: string) => void;
};

export function ColorMenu({ onColorSelect }: ColorMenuProps) {
  const colors = [
    { color: "#FF0000", label: "Red" },
    { color: "#00FF00", label: "Green" },
    { color: "#0000FF", label: "Blue" },
    { color: "#FFA500", label: "Orange" },
    { color: "#FFFF00", label: "Yellow" },
    { color: "#800080", label: "Purple" },
    { color: "#00FFFF", label: "Cyan" },
    { color: "#FF00FF", label: "Magenta" },
    { color: "#008000", label: "Dark Green" },
    { color: "#FFC0CB", label: "Pink" },
    { color: "#A52A2A", label: "Brown" },
    { color: "#808080", label: "Gray" },
    { color: "#000000", label: "Black" },
    { color: "#FFFFFF", label: "White" },
    { color: "#FFD700", label: "Gold" },
    { color: "#C0C0C0", label: "Silver" },
    { color: "#4B0082", label: "Indigo" },
    { color: "#EE82EE", label: "Violet" },
    { color: "#008080", label: "Teal" },
    { color: "#800000", label: "Maroon" },
    { color: "#ADFF2F", label: "Green Yellow" },
    { color: "#FF4500", label: "Orange Red" },
    { color: "#DA70D6", label: "Orchid" },
    { color: "#F0E68C", label: "Khaki" },
    { color: "#B22222", label: "Firebrick" },
    { color: "#5F9EA0", label: "Cadet Blue" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {colors.map((c) => (
        <ColorButton
          key={c.label}
          color={c.color}
          label={c.label}
          onClick={() => onColorSelect(c.color)}
        />
      ))}
    </div>
  );
}
