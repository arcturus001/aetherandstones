import { Text, TextField, TextArea, Button, Heading } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { PageHero } from "../components/PageHero";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log("Form submitted:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      style={style({
        minHeight: "[100vh]",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <SEO 
        title="Contact Us - Aether & Stones"
        description="Get in touch with Aether & Stones. We're here to help with questions about our products, orders, or anything else."
      />
      <Header />
      <main
        style={style({
          flex: 1,
          padding: "[64px 16px 80px]",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        })}
      >
        <PageHero
          title="Contact Us"
          subtitle="We're here to help."
          disclaimer="Share any questions, custom requests, or feedback and we'll get back to you as quickly as possible."
        />

        <section
          style={style({
            maxWidth: "[1200px]",
            marginX: "auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
            gap: 64,
            alignItems: "start",
          })}
        >
          {/* Contact Form */}
          <div style={style({ display: "flex", flexDirection: "column", gap: 24 })}>
            <Heading
              level={2}
              styles={style({
                fontSize: "[28px]",
                fontWeight: "bold",
                color: "white",
                marginBottom: 8,
              })}
            >
              Send us a message
            </Heading>
            <form onSubmit={handleSubmit} style={style({ display: "flex", flexDirection: "column", gap: 20 })}>
              <TextField
                label="Name"
                isRequired
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
              />
              <TextField
                label="Email"
                type="email"
                isRequired
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your.email@example.com"
              />
              <TextField
                label="Subject"
                isRequired
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="What's this about?"
              />
              <TextArea
                label="Message"
                isRequired
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Tell us more..."
                rows={6}
              />
              <Button
                type="submit"
                variant="accent"
                size="L"
                styles={style({
                  marginTop: 8,
                  width: "100%",
                })}
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div style={style({ display: "flex", flexDirection: "column", gap: 32 })}>
            <Heading
              level={2}
              styles={style({
                fontSize: "[28px]",
                fontWeight: "bold",
                color: "white",
                marginBottom: 8,
              })}
            >
              Get in touch
            </Heading>
            <div style={style({ display: "flex", flexDirection: "column", gap: 24 })}>
              <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
                <Text
                  styles={style({
                    fontWeight: "600",
                    fontSize: "[16px]",
                    color: "white",
                  })}
                >
                  Email
                </Text>
                <Text
                  styles={style({
                    color: "[rgba(255, 255, 255, 0.7)]",
                    fontSize: "[15px]",
                  })}
                >
                  hello@aetherandstones.com
                </Text>
              </div>
              <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
                <Text
                  styles={style({
                    fontWeight: "600",
                    fontSize: "[16px]",
                    color: "white",
                  })}
                >
                  Phone
                </Text>
                <Text
                  styles={style({
                    color: "[rgba(255, 255, 255, 0.7)]",
                    fontSize: "[15px]",
                  })}
                >
                  +1 (555) 123-4567
                </Text>
              </div>
              <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
                <Text
                  styles={style({
                    fontWeight: "600",
                    fontSize: "[16px]",
                    color: "white",
                  })}
                >
                  Social Media
                </Text>
                <Text
                  styles={style({
                    color: "[rgba(255, 255, 255, 0.7)]",
                    fontSize: "[15px]",
                  })}
                >
                  Instagram @aetherandstones
                </Text>
              </div>
              <div style={style({ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 })}>
                <Text
                  styles={style({
                    color: "[rgba(255, 255, 255, 0.6)]",
                    lineHeight: "[1.6]",
                  })}
                >
                  Need to check order status, explore customizations, or talk stones? Drop us an email or fill
                  out the form and we'll reply within one business day.
                </Text>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;




