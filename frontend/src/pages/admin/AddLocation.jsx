import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import AdminMap from "./AdminMap";
import AddServiceIconModal from "./AddServiceIconModal";
import * as LucideIcons from "lucide-react";
import { Plus, Building2, MapPin, Phone, Hospital, Shield, Flame, Car, Zap } from 'lucide-react';
import { toast } from 'react-toastify'

const AddLocation = () => {
const [formData, setFormData] = useState({
  name: '',
  serviceType: '',
  newServiceType: '',
  phone1: '',
  phone2: '',
  address: '',
  latitude: null,
  longitude: null,
  selectedIcon: null,
  selectedIconColor: null
});
  const [serviceTypes, setServiceTypes] = useState([]);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [showNewServiceType, setShowNewServiceType] = useState(false);

  const [iconOptions, setIconOptions] = useState([
    { id: 'hospital', icon: Hospital, label: 'Hospital', color: 'rose-500' },
    { id: 'police', icon: Shield, label: 'Police', color: 'blue-600' },
    { id: 'fire', icon: Flame, label: 'Fire Department', color: 'red-600' },
    { id: 'ambulance', icon: Car, label: 'Ambulance', color: 'emerald-500' },
    { id: 'emergency', icon: Zap, label: 'Emergency', color: 'amber-500' },
  ]);

  const colorClasses = {
    'rose-500': 'text-rose-500',
    'blue-600': 'text-blue-600',
    'red-600': 'text-red-600',
    'emerald-500': 'text-emerald-500',
    'amber-500': 'text-amber-500',
  };

  const toPascal = (s) =>
    String(s || "")
      .split(/[-_ ]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");

  // helper: normalize an id to common cleaned forms
  const buildCandidates = (raw) => {
    if (!raw) return [];
    const r = String(raw).trim();
    const lower = r.toLowerCase();

    // common stripped variants
    const strippedIcon = lower.replace(/icon$/i, "");          // flameicon -> flame
    const strippedLucide = strippedIcon.replace(/^lucide/i, "");// lucideshield -> shield
    const stripNonAlnum = strippedLucide.replace(/[^a-z0-9]+/gi, ""); // remove punctuation

    const candidates = new Set([
      lower,
      strippedIcon,
      strippedLucide,
      stripNonAlnum,
      toPascal(lower),
      toPascal(strippedIcon),
      toPascal(strippedLucide),
    ]);

    return Array.from(candidates).filter(Boolean);
  };


  const getIconComponentById = (id) => {
    if (!id) return Hospital; // fallback

    // 1) check local iconOptions first (exact id match or lowercase match)
    const foundLocal = iconOptions.find(o => (o.id === id) || (String(o.id).toLowerCase() === String(id).toLowerCase()));
    if (foundLocal) return foundLocal.icon;

    // 2) build a list of candidate names derived from id
    const candidates = buildCandidates(id);

    // 3) Try exact PascalCase / exact Lucide key matches
    for (const cand of candidates) {
      const pascal = toPascal(cand);
      if (LucideIcons[pascal]) return LucideIcons[pascal];

      // also check lowercase keys (some exports might be different)
      const exactLowerKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === cand.toLowerCase());
      if (exactLowerKey) return LucideIcons[exactLowerKey];
    }

    // 4) Loose include match (last resort). Prefer longer matches to avoid accidental matches.
    const lowerId = String(id).toLowerCase();
    const keys = Object.keys(LucideIcons);
    // prefer keys that include the id or id includes the key
    const includeMatch = keys.find(k => k.toLowerCase().includes(lowerId) || lowerId.includes(k.toLowerCase()));
    if (includeMatch) return LucideIcons[includeMatch];

    // 5) fallback
    return Hospital;
  };

  // color helper: accepts tailwind tokens (e.g. "blue-600") or hex ("#ff0000")
  const getColorProps = (color) => {
    if (!color) return { className: "", style: {} };
    // if color exactly matches a token you kept in colorClasses, use class
    if (colorClasses[color]) {
      return { className: colorClasses[color], style: {} };
    }
    // otherwise assume it's a CSS color string (hex or rgb)
    return { className: "", style: { color } };
  };


useEffect(() => {
  const fetchServices = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/services`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        const mapped = data.data.map(svc => {
          const rawIcon = svc.icon || svc.iconId || svc.iconName;
          const IconComponent = svc.IconComponent || getIconComponentById(rawIcon);
          return {
            ...svc,
            IconComponent,
            iconId: String(rawIcon || "").trim(),
            name: svc.name || svc.label || svc._id
          };
        });
        setServiceTypes(mapped);

        // 👇 set the FIRST service as default
        if (mapped.length > 0) {
          setFormData(prev => ({
            ...prev,
            serviceType: mapped[0]._id,
            selectedIcon: mapped[0].iconId || mapped[0].icon,
            selectedIconColor: mapped[0].color
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  fetchServices();
}, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

const handleServiceTypeChange = (value) => {
  if (value === "add-new") {
    setShowNewServiceType(true);
    setFormData((prev) => ({
      ...prev,
      serviceType: "",
      selectedIcon: "__add-new__",   // 👈 special marker value
      selectedIconColor: null
    }));
  } else {
    setShowNewServiceType(false);

    // find the chosen service
    const selectedService = serviceTypes.find(s => s._id === value);

    setFormData((prev) => ({
      ...prev,
      serviceType: value,
      newServiceType: "",
      // 👇 sync icon + color
      selectedIcon: selectedService?.iconId || selectedService?.icon || null,
      selectedIconColor: selectedService?.color || null
    }));
  }
};

  const addNewServiceType = async () => {
    if (!formData.selectedIcon) {
      toast.error("Please select an icon before adding a service");
      return;
    }
    if (formData.newServiceType.trim()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/services`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: formData.newServiceType.trim(),
            icon: formData.selectedIcon,
            color: formData.selectedIconColor || "#2563eb",
          }),

        });

        const data = await res.json();

        if (res.ok) {
          setServiceTypes((prev) => [...prev, data.data]);
          setFormData((prev) => ({
            ...prev,
            serviceType: data.data._id, // store service id instead of text
            newServiceType: "",
          }));
          setShowNewServiceType(false);
        } else {
          alert(data.message || "Failed to add service");
        }
      } catch (error) {
        console.error("Error adding service:", error);
      }
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send data to backend
  };

  const isFormValid = formData.name &&
    (formData.serviceType || formData.newServiceType) &&
    formData.phone1 &&
    formData.address &&
    formData.latitude &&
    formData.longitude;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Location</h1>
          <p className="text-muted-foreground">Add a new emergency service location to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter service name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select onValueChange={handleServiceTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="add-new">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add new type
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showNewServiceType && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new service type"
                      value={formData.newServiceType}
                      onChange={(e) => handleInputChange('newServiceType', e.target.value)}
                    />
                    <Button type="button" onClick={addNewServiceType} size="sm">
                      Add
                    </Button>
                  </div>
                )}


              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone1">Primary Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone1"
                      placeholder="+91 123-456-7890"
                      value={formData.phone1}
                      onChange={(e) => handleInputChange('phone1', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone2">Secondary Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone2"
                      placeholder="+91 123-456-7890"
                      value={formData.phone2}
                      onChange={(e) => handleInputChange('phone2', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter the complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Icon Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Service Icon</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose an icon to represent this service type
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {serviceTypes.map(service => {
                  const IconComponent = service.IconComponent || getIconComponentById(service.icon || service.iconId);
                  const colorProps = getColorProps(service.color);

                  return (
                    <div
                      key={service._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-accent ${formData.selectedIcon === service.iconId ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                      onClick={() => handleInputChange('selectedIcon', service.iconId)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <IconComponent className={`h-6 w-6 ${colorProps.className}`} style={colorProps.style} />
                        <span className="text-xs font-medium">{service.name || service.label || service.iconId}</span>
                      </div>
                    </div>
                  );
                })}

<div
  className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-accent
    ${formData.selectedIcon === "__add-new__" ? "border-primary bg-primary/10" : "border-border"}`}
  onClick={() => setIsIconModalOpen(true)}
>
  <Plus className="h-6 w-6 text-primary" />
  <span className="text-xs font-medium">Add Icon</span>
</div>

              </div>

              <AddServiceIconModal
                open={isIconModalOpen}
                onClose={() => setIsIconModalOpen(false)}
                onSave={(newIcon) => {
                  // newIcon = { id, icon (React comp), label, color (hex) }
                  const newService = {
                    _id: `local-${newIcon.id}-${Date.now()}`,
                    name: newIcon.label,
                    label: newIcon.label,
                    icon: newIcon.id,           // string id to match DB shape
                    iconId: newIcon.id,
                    IconComponent: newIcon.icon, // actual React component
                    color: newIcon.color        // hex color
                  };

                  // 1) add to serviceTypes immediately so grid shows it
                  setServiceTypes(prev => [...prev, newService]);

                  // 2) keep iconOptions in sync if you want (optional)
                  setIconOptions(prev => [...prev, { id: newIcon.id, icon: newIcon.icon, label: newIcon.label, color: newIcon.color }]);

                  // 3) select it in the form and save color so addNewServiceType can use it
                  setFormData(prev => ({ ...prev, selectedIcon: newIcon.id, selectedIconColor: newIcon.color }));

                  setIsIconModalOpen(false);
                }}
              />



            </CardContent>
          </Card>
        </div>

        {/* Right Column - Map */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location on Map
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Search for a location or click on the map to place a marker
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Map Component */}
              <AdminMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationSelect={(lat, lng) =>
                  setFormData((prev) => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                  }))
                }
              />

              {/* Coordinates Display */}
              {formData.latitude && formData.longitude && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-accent rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Latitude</Label>
                    <p className="font-mono text-sm">{formData.latitude}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Longitude</Label>
                    <p className="font-mono text-sm">{formData.longitude}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Submit Button */}
          <div className="lg:sticky lg:top-6">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!isFormValid}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Emergency Location
            </Button>

            {!isFormValid && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Please fill all required fields and place a marker on the map
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddLocation;