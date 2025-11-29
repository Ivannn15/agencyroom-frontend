import ClientsNewForm from "./ClientsNewForm";
import { createClient } from "./actions";

export default function NewClientPage() {
  return <ClientsNewForm createClient={createClient} />;
}
