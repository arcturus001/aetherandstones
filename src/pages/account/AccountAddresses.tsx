import { useState, useEffect } from "react";
import { Text, Heading, Button, TextField } from "../../components/ui";
import { style } from "../../utils/styles";
import { AddressSkeleton } from "../../components/LoadingSkeleton";

interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const AccountAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // Form state for editing
  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      region: address.region || "",
      postalCode: address.postalCode,
      country: address.country,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
    });
    setError("");
  };

  const handleSave = async (addressId: string) => {
    if (!formData.line1 || !formData.city || !formData.postalCode || !formData.country) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/addresses?id=${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          line1: formData.line1,
          line2: formData.line2 || null,
          city: formData.city,
          region: formData.region || null,
          postalCode: formData.postalCode,
          country: formData.country,
        }),
      });

      if (response.ok) {
        await loadAddresses();
        setEditingId(null);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update address");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Failed to update address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/addresses?id=${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await loadAddresses();
      } else {
        alert("Failed to delete address");
      }
    } catch (error) {
      alert("Network error. Please try again.");
      console.error("Failed to delete address:", error);
    }
  };

  if (isLoading) {
    return (
      <div style={style({ display: "flex", flexDirection: "column", gap: 24 })}>
        <Heading
          level={2}
          styles={style({
            fontSize: "[24px]",
            fontWeight: "bold",
            color: "white",
          })}
        >
          Saved Addresses
        </Heading>
        <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
          {[1, 2].map((i) => (
            <AddressSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={style({ display: "flex", flexDirection: "column", gap: 24 })}>
      <Heading
        level={2}
        styles={style({
          fontSize: "[24px]",
          fontWeight: "bold",
          color: "white",
        })}
      >
        Saved Addresses ({addresses.length})
      </Heading>

      {addresses.length === 0 ? (
        <div
          style={style({
            padding: 48,
            backgroundColor: "[#141414]",
            border: "[1px solid #2E2E2E]",
            borderRadius: "[8px]",
            textAlign: "center",
          })}
        >
          <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]", fontSize: "[16px]" })}>
            You don't have any saved addresses yet.
          </Text>
          <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]", fontSize: "[14px]", marginTop: 8 })}>
            Addresses will be saved automatically when you place an order.
          </Text>
        </div>
      ) : (
        <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
          {addresses.map((address) => (
            <div
              key={address.id}
              style={style({
                padding: 32,
                backgroundColor: "[#141414]",
                border: "[1px solid #2E2E2E]",
                borderRadius: "[8px]",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              })}
            >
              {editingId === address.id ? (
                <>
                  <Heading
                    level={3}
                    styles={style({
                      fontSize: "[18px]",
                      fontWeight: "600",
                      color: "white",
                      textTransform: "capitalize",
                    })}
                  >
                    Edit {address.type} Address
                  </Heading>

                  {error && (
                    <Text styles={style({ color: "red", fontSize: "[14px]" })}>
                      {error}
                    </Text>
                  )}

                  <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
                    <TextField
                      label="Address Line 1"
                      isRequired
                      value={formData.line1}
                      onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                      styles={style({ width: "100%" })}
                    />
                    <TextField
                      label="Address Line 2 (Optional)"
                      value={formData.line2}
                      onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                      styles={style({ width: "100%" })}
                    />
                    <div style={style({ display: "grid", gridTemplateColumns: "[1fr 1fr]", gap: 16 })}>
                      <TextField
                        label="City"
                        isRequired
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        styles={style({ width: "100%" })}
                      />
                      <TextField
                        label="State/Region"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        styles={style({ width: "100%" })}
                      />
                    </div>
                    <div style={style({ display: "grid", gridTemplateColumns: "[1fr 1fr]", gap: 16 })}>
                      <TextField
                        label="Postal Code"
                        isRequired
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        styles={style({ width: "100%" })}
                      />
                      <TextField
                        label="Country"
                        isRequired
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        styles={style({ width: "100%" })}
                      />
                    </div>
                  </div>

                  <div style={style({ display: "flex", gap: 12 })}>
                    <Button
                      variant="accent"
                      size="M"
                      onClick={() => handleSave(address.id)}
                      isPending={isSaving}
                      isDisabled={isSaving}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="secondary"
                      size="M"
                      onClick={cancelEdit}
                      isDisabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div style={style({ display: "flex", justifyContent: "space-between", alignItems: "start" })}>
                    <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
                      <Heading
                        level={3}
                        styles={style({
                          fontSize: "[18px]",
                          fontWeight: "600",
                          color: "white",
                          textTransform: "capitalize",
                        })}
                      >
                        {address.type} Address
                      </Heading>
                      <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", lineHeight: "[1.6]" })}>
                        {address.line1}
                        {address.line2 && <><br />{address.line2}</>}
                        <br />
                        {address.city}{address.region ? `, ${address.region}` : ""} {address.postalCode}
                        <br />
                        {address.country}
                      </Text>
                    </div>
                    <div style={style({ display: "flex", gap: 8 })}>
                      <Button
                        variant="secondary"
                        size="S"
                        onClick={() => startEdit(address)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="S"
                        onClick={() => handleDelete(address.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

