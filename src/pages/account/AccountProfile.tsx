import { useState, useEffect } from "react";
import { Text, Heading, Button, TextField } from "../../components/ui";
import { style } from "../../utils/styles";
import { ProfileSkeleton } from "../../components/LoadingSkeleton";
import type { User } from "../../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const AccountProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name,
          phone: data.user.phone || "",
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = () => {
    setIsEditing(true);
    setError("");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || "",
      });
    }
    setError("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
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
          Profile
        </Heading>
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={style({ padding: 48, textAlign: "center" })}>
        <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
          Failed to load profile
        </Text>
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
        Profile
      </Heading>

      <div
        style={style({
          padding: 32,
          backgroundColor: "[#141414]",
          border: "[1px solid #2E2E2E]",
          borderRadius: "[8px]",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        })}
      >
        {isEditing ? (
          <>
            {error && (
              <Text styles={style({ color: "red", fontSize: "[14px]" })}>
                {error}
              </Text>
            )}

            <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
              <TextField
                label="Email"
                type="email"
                value={user.email}
                readOnly
                styles={style({ opacity: 0.6, width: "100%" })}
              />
              <TextField
                label="Full Name"
                isRequired
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                styles={style({ width: "100%" })}
              />
              <TextField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                styles={style({ width: "100%" })}
              />
            </div>

            <div style={style({ display: "flex", gap: 12 })}>
              <Button
                variant="accent"
                size="M"
                onClick={handleSave}
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
            <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div>
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", marginBottom: 4 })}>
                  Email
                </Text>
                <Text styles={style({ color: "white", fontSize: "[16px]" })}>
                  {user.email}
                </Text>
              </div>
              <div>
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", marginBottom: 4 })}>
                  Full Name
                </Text>
                <Text styles={style({ color: "white", fontSize: "[16px]" })}>
                  {user.name}
                </Text>
              </div>
              <div>
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", marginBottom: 4 })}>
                  Phone Number
                </Text>
                <Text styles={style({ color: "white", fontSize: "[16px]" })}>
                  {user.phone || "Not provided"}
                </Text>
              </div>
              <div>
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", marginBottom: 4 })}>
                  Member Since
                </Text>
                <Text styles={style({ color: "white", fontSize: "[16px]" })}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </div>

            <Button
              variant="accent"
              size="M"
              onClick={startEdit}
              styles={style({ alignSelf: "flex-start" })}
            >
              Edit Profile
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

