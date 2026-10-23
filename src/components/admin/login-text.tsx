import { PayloadLink } from "@payloadcms/ui";
import "./login-text.css";

export default function LoginText() {
  return (
    <PayloadLink
      className="login-return-link"
      href="https://www.lyovson.com"
      target="_blank"
    >
      Return to Lyovson.com
    </PayloadLink>
  );
}
