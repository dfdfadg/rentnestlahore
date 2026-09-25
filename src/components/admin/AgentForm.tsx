import { saveAgent } from "@/app/actions/admin";
import { ActionForm } from "./ActionForm";

type Agent = { id: string; name: string; agency: string | null; type: string; phone: string; whatsapp: string | null; email: string | null; about: string | null; imageUrl: string | null; verified: boolean; areasServed: { id: string }[] };

export function AgentForm({ agent, locations }: { agent?: Agent; locations: { id: string; name: string }[] }) {
  const served = new Set(agent?.areasServed.map((a) => a.id));
  return (
    <ActionForm action={saveAgent} submitLabel={agent ? "Save agent" : "Create agent"}>
      {agent && <input type="hidden" name="id" value={agent.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Name *</label><input name="name" defaultValue={agent?.name} required className="input" /></div>
        <div><label className="label">Agency</label><input name="agency" defaultValue={agent?.agency ?? ""} className="input" /></div>
        <div>
          <label className="label">Type</label>
          <select name="type" defaultValue={agent?.type ?? "AGENT"} className="input"><option value="AGENT">Agent</option><option value="LANDLORD">Landlord</option></select>
        </div>
        <div><label className="label">Email</label><input name="email" type="email" defaultValue={agent?.email ?? ""} className="input" /></div>
        <div><label className="label">Phone *</label><input name="phone" defaultValue={agent?.phone} required className="input" /></div>
        <div><label className="label">WhatsApp</label><input name="whatsapp" defaultValue={agent?.whatsapp ?? ""} className="input" /></div>
        <div className="sm:col-span-2"><label className="label">Profile image URL (https)</label><input name="imageUrl" type="url" defaultValue={agent?.imageUrl ?? ""} className="input" /></div>
      </div>
      <div><label className="label">About</label><textarea name="about" rows={4} defaultValue={agent?.about ?? ""} className="input" /></div>
      <fieldset>
        <legend className="label">Areas served</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {locations.map((l) => (
            <label key={l.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="areaIds" value={l.id} defaultChecked={served.has(l.id)} className="h-4 w-4 accent-brick-600" /> {l.name}</label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="verified" defaultChecked={agent?.verified} className="h-4 w-4 accent-brick-600" /> Verified agent (only tick after checking identity/credentials)</label>
    </ActionForm>
  );
}
