import { Inbox } from "@/components/admin/inbox";
import { PageHeader } from "@/components/admin/shell";
import { listEmails, listMessages } from "@/lib/db";

export const metadata = { title: "Inbox & emails" };

export default async function InboxPage() {
  const [messages, emails] = await Promise.all([listMessages(), listEmails()]);
  return (
    <>
      <PageHeader title="Inbox & emails" sub="Customer enquiries and every transactional email the store has sent." />
      <Inbox messages={messages} emails={emails} resend={Boolean(process.env.RESEND_API_KEY)} />
    </>
  );
}
