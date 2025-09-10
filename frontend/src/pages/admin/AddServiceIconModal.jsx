import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import * as LucideIcons from "lucide-react";
import { HexColorPicker } from "react-colorful";

const AddServiceIconModal = ({ open, onClose, onSave }) => {
    const [search, setSearch] = useState("");
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#2563eb"); // default hex color (blue)

const availableIcons = useMemo(() => {
  const seen = new Set();
  return Object.entries(LucideIcons)
    .map(([name, IconComp]) => ({
      id: name.toLowerCase(), // safer key
      icon: IconComp,
      label: name,
    }))
    .filter(icon => {
      if (seen.has(icon.id)) return false;
      seen.add(icon.id);
      return true;
    });
}, []);


    // Filter icons by search term
    const filteredIcons = availableIcons.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
    );


    const handleSave = () => {
        if (selectedIcon) {
            onSave({
                id: selectedIcon.id,
                icon: selectedIcon.icon,
                label: selectedIcon.label,
                color: selectedColor, // save as hex
            });
            onClose();
            setSearch("");
            setSelectedIcon(null);
            setSelectedColor("#2563eb");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Service Icon</DialogTitle>
                </DialogHeader>

                {/* Search Bar */}
                <Input
                    placeholder="Search icons... (e.g. hospital, shield, phone)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mt-2"
                />

                {/* Icons Grid */}
                <div className="grid grid-cols-4 gap-3 mt-4 max-h-64 overflow-y-auto">
                    {filteredIcons.length > 0 ? (
                        filteredIcons.slice(0, 50).map((option) => {
                            const IconComp = option.icon;
                            return (
                                <div
                                    key={option.id}
                                    className={`p-3 border rounded-lg cursor-pointer flex flex-col items-center justify-center transition ${selectedIcon?.id === option.id
                                        ? "border-primary bg-primary/10"
                                        : "border-border"
                                        }`}
                                    onClick={() => setSelectedIcon(option)}
                                >
                                    <IconComp className="h-6 w-6" style={{ color: selectedColor }} />
                                    <span className="text-[10px] truncate">{option.label}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground col-span-4 text-center">
                            No icons found
                        </p>
                    )}
                </div>

                {/* Color Picker */}
                <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-2">Pick a color:</p>
                    <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                    <div className="mt-2 flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: selectedColor }}
                        />
                        <span className="text-xs font-mono">{selectedColor}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!selectedIcon}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddServiceIconModal;
