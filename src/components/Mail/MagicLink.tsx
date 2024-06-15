import {
    Body,
    Head,
    Html,
    Text,
    Button,
    Container,
    Section,
} from "@react-email/components";

export default function MagicLink({ url }: { url: string }) {
    return (
        <Html style={main}>
            <Head />
            <Body>
                <Container
                    style={{
                        justifyContent: "center",
                        textAlign: "center",
                        maxWidth: "486px",
                    }}
                >
                    <Section
                        // shadow-lg rounded-lg
                        style={{
                            paddingBottom: "3rem",
                            paddingTop: "1.5rem",
                            paddingLeft: "2rem",
                            paddingRight: "2rem",
                            backgroundColor: "#fff",
                            borderRadius: "0.5rem",
                            boxShadow:
                                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <Text style={pill}>Sign in with Magic Link</Text>
                        <Text style={title}>Welcome back!</Text>
                        <Text style={subtitle}>
                            Click the button below to sign in to your Twatter
                            account.
                        </Text>
                        <Button href={url} style={primButton}>
                            Sign in with Magic Link
                        </Button>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const pill = {
    display: "inline-block",
    borderRadius: "9999px",
    backgroundColor: "#f7fafc",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#1a202c",
};

const title = {
    fontSize: "2.75rem",
    fontWeight: 700,
    letterSpacing: "-.025em",
    paddingBottom: ".25rem",
};

const subtitle = {
    fontSize: "1.125rem",
    fontWeight: 500,
    color: "#4a5568",
    paddingBottom: "1.5rem",
};

const primButton = {
    backgroundColor: "#2d3748",
    color: "#ffffff",
    borderRadius: "5px",
    paddingTop: "12px",
    paddingBottom: "12px",
    paddingLeft: "24px",
    paddingRight: "24px",

    fontWeight: 500,
};
