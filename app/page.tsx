"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type View = "today" | "family" | "medicines" | "history";
type Modal = "member" | "medicine" | null;
type DoseStatus = "taken" | "skipped";

type Member = {
  id: string;
  name: string;
  relationship: string;
  initials: string;
  color: string;
};

type Medicine = {
  id: string;
  name: string;
  dose: string;
  memberId: string;
  times: string[];
  instruction: string;
  color: string;
};

type DoseLog = {
  id: string;
  medicineId: string;
  memberId: string;
  date: string;
  scheduledTime: string;
  status: DoseStatus;
  recordedAt: string;
};

type AppState = {
  members: Member[];
  medicines: Medicine[];
  logs: DoseLog[];
};

const STORAGE_KEY = "cuidar-med-family-v1";
const MEMBER_COLORS = ["#ea765e", "#4f8e78", "#7766a7", "#d79b39", "#527aa8"];
const MEDICINE_COLORS = ["#e57a61", "#5a927d", "#7f6cac", "#d29a3f", "#5e82ad"];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateKey(date);
}

function createDemoState(): AppState {
  const today = localDateKey();
  const members: Member[] = [
    { id: "maria", name: "Maria", relationship: "Mãe", initials: "MA", color: "#ea765e" },
    { id: "joao", name: "João", relationship: "Pai", initials: "JO", color: "#4f8e78" },
    { id: "voce", name: "Você", relationship: "Meu perfil", initials: "VC", color: "#7766a7" },
  ];
  const medicines: Medicine[] = [
    { id: "losartana", name: "Losartana", dose: "50 mg", memberId: "maria", times: ["08:00", "20:00"], instruction: "Após a refeição", color: "#e57a61" },
    { id: "metformina", name: "Metformina", dose: "850 mg", memberId: "joao", times: ["07:30", "19:30"], instruction: "Junto das refeições", color: "#5a927d" },
    { id: "atorvastatina", name: "Atorvastatina", dose: "20 mg", memberId: "voce", times: ["21:00"], instruction: "Conforme orientação médica", color: "#7f6cac" },
  ];
  const logs: DoseLog[] = [
    { id: "demo-1", medicineId: "metformina", memberId: "joao", date: today, scheduledTime: "07:30", status: "taken", recordedAt: "07:36" },
    { id: "demo-2", medicineId: "losartana", memberId: "maria", date: today, scheduledTime: "08:00", status: "taken", recordedAt: "08:04" },
    { id: "demo-3", medicineId: "losartana", memberId: "maria", date: dateDaysAgo(1), scheduledTime: "20:00", status: "taken", recordedAt: "20:08" },
    { id: "demo-4", medicineId: "metformina", memberId: "joao", date: dateDaysAgo(1), scheduledTime: "19:30", status: "taken", recordedAt: "19:32" },
    { id: "demo-5", medicineId: "atorvastatina", memberId: "voce", date: dateDaysAgo(2), scheduledTime: "21:00", status: "skipped", recordedAt: "22:15" },
  ];
  return { members, medicines, logs };
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(year, month - 1, day));
}

function minutesFromTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Home() {
  const [view, setView] = useState<View>("today");
  const [modal, setModal] = useState<Modal>(null);
  const [state, setState] = useState<AppState>(() => createDemoState());
  const [hydrated, setHydrated] = useState(false);
  const [clockMinutes, setClockMinutes] = useState(() => new Date().getHours() * 60 + new Date().getMinutes());
  const [toast, setToast] = useState("");
  const [historyMember, setHistoryMember] = useState("all");

  const today = localDateKey();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved) as AppState);
    } catch {
      // The demo remains usable even if browser storage is unavailable.
    }
    setHydrated(true);
    const timer = window.setInterval(() => {
      const now = new Date();
      setClockMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const doses = useMemo(() => {
    return state.medicines
      .flatMap((medicine) =>
        medicine.times.map((time) => {
          const member = state.members.find((item) => item.id === medicine.memberId)!;
          const log = state.logs.find(
            (item) => item.date === today && item.medicineId === medicine.id && item.scheduledTime === time,
          );
          const isLate = !log && minutesFromTime(time) < clockMinutes;
          return { medicine, member, time, log, isLate };
        }),
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [state, today, clockMinutes]);

  const pendingDoses = doses.filter((dose) => !dose.log);
  const focusDose = pendingDoses.find((dose) => !dose.isLate) ?? pendingDoses[0];
  const takenCount = doses.filter((dose) => dose.log?.status === "taken").length;
  const adherence = doses.length ? Math.round((takenCount / doses.length) * 100) : 0;

  const memberById = (id: string) => state.members.find((member) => member.id === id);
  const medicineById = (id: string) => state.medicines.find((medicine) => medicine.id === id);

  function recordDose(medicineId: string, memberId: string, scheduledTime: string, status: DoseStatus) {
    const now = new Date();
    const recordedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setState((current) => ({
      ...current,
      logs: [
        ...current.logs.filter(
          (log) => !(log.date === today && log.medicineId === medicineId && log.scheduledTime === scheduledTime),
        ),
        { id: `${Date.now()}`, medicineId, memberId, date: today, scheduledTime, status, recordedAt },
      ],
    }));
    setToast(status === "taken" ? "Dose registrada como tomada" : "Dose marcada como não tomada");
  }

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const relationship = String(data.get("relationship") || "Familiar").trim();
    if (!name) return;
    setState((current) => ({
      ...current,
      members: [
        ...current.members,
        {
          id: `member-${Date.now()}`,
          name,
          relationship,
          initials: initialsFromName(name),
          color: MEMBER_COLORS[current.members.length % MEMBER_COLORS.length],
        },
      ],
    }));
    setModal(null);
    setToast(`${name} foi adicionado à família`);
  }

  function addMedicine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const times = String(data.get("times") || "")
      .split(",")
      .map((time) => time.trim())
      .filter((time) => /^\d{2}:\d{2}$/.test(time));
    if (!name || !times.length) return;
    setState((current) => ({
      ...current,
      medicines: [
        ...current.medicines,
        {
          id: `medicine-${Date.now()}`,
          name,
          dose: String(data.get("dose") || "Dose não informada"),
          memberId: String(data.get("memberId")),
          times,
          instruction: String(data.get("instruction") || "Conforme orientação médica"),
          color: MEDICINE_COLORS[current.medicines.length % MEDICINE_COLORS.length],
        },
      ],
    }));
    setModal(null);
    setToast(`${name} foi adicionado à rotina`);
  }

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "today", label: "Hoje", icon: "⌂" },
    { id: "family", label: "Familiares", icon: "♧" },
    { id: "medicines", label: "Medicamentos", icon: "▰" },
    { id: "history", label: "Histórico", icon: "↺" },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("today")} aria-label="Ir para hoje">
          <span className="brand-mark">+</span>
          <span>Cuidar</span>
        </button>

        <nav className="side-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="storage-note">
          <span className="storage-icon">✓</span>
          <div><strong>Dados protegidos</strong><small>Salvos neste dispositivo</small></div>
        </div>
        <button className="profile-button">
          <span className="avatar small" style={{ background: "#7766a7" }}>VC</span>
          <span><strong>Seu perfil</strong><small>Administrador</small></span>
          <span aria-hidden="true">•••</span>
        </button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">CUIDADO EM FAMÍLIA</p>
            <h1>{view === "today" ? "Olá! Vamos cuidar de todos?" : navItems.find((item) => item.id === view)?.label}</h1>
            <p className="date-line">
              {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
            </p>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notificações"><span className="notification-dot" />♢</button>
            <button className="primary-button" onClick={() => setModal(view === "family" ? "member" : "medicine")}>
              <span>+</span>{view === "family" ? "Novo familiar" : "Novo medicamento"}
            </button>
          </div>
        </header>

        {view === "today" && (
          <div className="dashboard-grid">
            <div className="main-column">
              {focusDose ? (
                <section className={`focus-card ${focusDose.isLate ? "late" : ""}`}>
                  <div className="focus-copy">
                    <span className="focus-kicker">{focusDose.isLate ? "DOSE EM ATRASO" : "PRÓXIMA DOSE"}</span>
                    <div className="focus-time-row"><strong>{focusDose.time}</strong><span>{focusDose.medicine.name} · {focusDose.medicine.dose}</span></div>
                    <div className="focus-person"><span className="avatar tiny" style={{ background: focusDose.member.color }}>{focusDose.member.initials}</span>{focusDose.member.name} · {focusDose.medicine.instruction}</div>
                  </div>
                  <div className="focus-actions">
                    <button className="taken-button" onClick={() => recordDose(focusDose.medicine.id, focusDose.member.id, focusDose.time, "taken")}>✓ Registrar tomada</button>
                    <button className="text-button light" onClick={() => recordDose(focusDose.medicine.id, focusDose.member.id, focusDose.time, "skipped")}>Não foi tomada</button>
                  </div>
                </section>
              ) : (
                <section className="focus-card complete-card"><span className="focus-kicker">TUDO CERTO POR HOJE</span><h2>Rotina concluída ✓</h2><p>Todas as doses de hoje já foram registradas.</p></section>
              )}

              <div className="section-heading">
                <div><p className="eyebrow">AGENDA</p><h2>Rotina de hoje</h2></div>
                <span className="day-progress"><strong>{takenCount}</strong> de {doses.length} tomadas</span>
              </div>

              <section className="timeline-card">
                {doses.length ? doses.map((dose) => (
                  <article className={`dose-row ${dose.log ? `is-${dose.log.status}` : dose.isLate ? "is-late" : ""}`} key={`${dose.medicine.id}-${dose.time}`}>
                    <div className="time-block"><strong>{dose.time}</strong><small>{minutesFromTime(dose.time) < 12 * 60 ? "manhã" : minutesFromTime(dose.time) < 18 * 60 ? "tarde" : "noite"}</small></div>
                    <span className="timeline-dot" style={{ borderColor: dose.medicine.color }} />
                    <div className="medicine-symbol" style={{ background: `${dose.medicine.color}1f`, color: dose.medicine.color }}>✦</div>
                    <div className="dose-copy"><strong>{dose.medicine.name} <span>{dose.medicine.dose}</span></strong><small><span className="avatar micro" style={{ background: dose.member.color }}>{dose.member.initials}</span>{dose.member.name} · {dose.medicine.instruction}</small></div>
                    {dose.log ? (
                      <span className={`status-pill ${dose.log.status}`}>{dose.log.status === "taken" ? `✓ Tomada às ${dose.log.recordedAt}` : "Não tomada"}</span>
                    ) : (
                      <div className="row-actions"><span className={`status-pill ${dose.isLate ? "late" : "pending"}`}>{dose.isLate ? "Atrasada" : "Pendente"}</span><button aria-label={`Registrar ${dose.medicine.name} como tomada`} onClick={() => recordDose(dose.medicine.id, dose.member.id, dose.time, "taken")}>✓</button></div>
                    )}
                  </article>
                )) : <div className="empty-state"><span>○</span><h3>Nenhuma dose agendada</h3><p>Adicione um medicamento para começar a rotina.</p></div>}
              </section>
            </div>

            <aside className="right-column">
              <section className="summary-card">
                <div className="ring" style={{ "--progress": `${adherence * 3.6}deg` } as React.CSSProperties}><span>{adherence}%</span></div>
                <div><p className="eyebrow">PROGRESSO DE HOJE</p><h3>{adherence >= 75 ? "Muito bem!" : "Um passo de cada vez"}</h3><small>{pendingDoses.length} {pendingDoses.length === 1 ? "dose restante" : "doses restantes"}</small></div>
              </section>

              <section className="panel-card">
                <div className="panel-title"><div><p className="eyebrow">QUEM VOCÊ CUIDA</p><h3>Sua família</h3></div><button onClick={() => setView("family")}>Ver todos</button></div>
                <div className="family-list">
                  {state.members.map((member) => {
                    const memberDoses = doses.filter((dose) => dose.member.id === member.id);
                    const memberTaken = memberDoses.filter((dose) => dose.log?.status === "taken").length;
                    return <button key={member.id} onClick={() => setView("family")}><span className="avatar" style={{ background: member.color }}>{member.initials}</span><span><strong>{member.name}</strong><small>{member.relationship} · {memberTaken}/{memberDoses.length} hoje</small></span><span>›</span></button>;
                  })}
                </div>
              </section>

              <section className="safety-card"><span>i</span><div><strong>Lembrete importante</strong><p>Este app organiza os registros. Horários e doses devem seguir a receita e a orientação de um profissional de saúde.</p></div></section>
            </aside>
          </div>
        )}

        {view === "family" && (
          <section className="page-section">
            <div className="section-intro"><div><p className="eyebrow">PERFIS</p><h2>Todos sob o mesmo cuidado</h2><p>Acompanhe a rotina de cada pessoa sem misturar medicamentos.</p></div><button className="secondary-button" onClick={() => setModal("member")}>+ Adicionar familiar</button></div>
            <div className="member-grid">
              {state.members.map((member) => {
                const memberMeds = state.medicines.filter((medicine) => medicine.memberId === member.id);
                const memberDoses = doses.filter((dose) => dose.member.id === member.id);
                const memberTaken = memberDoses.filter((dose) => dose.log?.status === "taken").length;
                return <article className="member-card" key={member.id}>
                  <div className="member-card-head"><span className="avatar large" style={{ background: member.color }}>{member.initials}</span><div><h3>{member.name}</h3><p>{member.relationship}</p></div><span className="member-score">{memberDoses.length ? Math.round(memberTaken / memberDoses.length * 100) : 0}%<small>hoje</small></span></div>
                  <div className="progress-track"><span style={{ width: `${memberDoses.length ? memberTaken / memberDoses.length * 100 : 0}%`, background: member.color }} /></div>
                  <p className="card-label">MEDICAMENTOS ATIVOS</p>
                  <div className="mini-med-list">{memberMeds.length ? memberMeds.map((medicine) => <div key={medicine.id}><span style={{ background: medicine.color }}>✦</span><p><strong>{medicine.name} · {medicine.dose}</strong><small>{medicine.times.join(" e ")}</small></p></div>) : <small>Nenhum medicamento cadastrado.</small>}</div>
                  <button className="card-link" onClick={() => setView("history")}>Ver histórico de {member.name} <span>→</span></button>
                </article>;
              })}
            </div>
          </section>
        )}

        {view === "medicines" && (
          <section className="page-section">
            <div className="section-intro"><div><p className="eyebrow">ROTINAS</p><h2>Medicamentos cadastrados</h2><p>Confira pessoa, dose, horários e observações em um só lugar.</p></div><button className="secondary-button" onClick={() => setModal("medicine")}>+ Novo medicamento</button></div>
            <div className="medicine-grid">
              {state.medicines.map((medicine) => {
                const member = memberById(medicine.memberId)!;
                return <article className="medicine-card" key={medicine.id}>
                  <div className="medicine-top"><span className="medicine-large-icon" style={{ background: `${medicine.color}1f`, color: medicine.color }}>✦</span><span className="active-label">Ativo</span></div>
                  <h3>{medicine.name}</h3><p className="dose-text">{medicine.dose}</p>
                  <div className="info-line"><span>◷</span><div><small>HORÁRIOS</small><strong>{medicine.times.join(" · ")}</strong></div></div>
                  <div className="info-line"><span className="avatar micro" style={{ background: member.color }}>{member.initials}</span><div><small>PARA</small><strong>{member.name}</strong></div></div>
                  <div className="instruction">{medicine.instruction}</div>
                </article>;
              })}
            </div>
          </section>
        )}

        {view === "history" && (
          <section className="page-section">
            <div className="section-intro"><div><p className="eyebrow">REGISTROS</p><h2>Histórico da família</h2><p>Veja o que foi tomado, por quem e em qual horário.</p></div><select value={historyMember} onChange={(event) => setHistoryMember(event.target.value)} aria-label="Filtrar histórico por familiar"><option value="all">Toda a família</option>{state.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
            <section className="history-panel">
              <div className="history-table-head"><span>Data</span><span>Medicamento</span><span>Familiar</span><span>Horário</span><span>Status</span></div>
              <div className="history-list">
                {state.logs.filter((log) => historyMember === "all" || log.memberId === historyMember).sort((a, b) => `${b.date}${b.recordedAt}`.localeCompare(`${a.date}${a.recordedAt}`)).map((log) => {
                  const medicine = medicineById(log.medicineId);
                  const member = memberById(log.memberId);
                  if (!medicine || !member) return null;
                  return <article key={log.id}><time>{log.date === today ? "Hoje" : formatDate(log.date)}</time><span className="history-medicine"><i style={{ background: medicine.color }} />{medicine.name}<small>{medicine.dose}</small></span><span><span className="avatar micro" style={{ background: member.color }}>{member.initials}</span>{member.name}</span><span>{log.scheduledTime}<small>registrado {log.recordedAt}</small></span><span className={`status-pill ${log.status}`}>{log.status === "taken" ? "✓ Tomada" : "Não tomada"}</span></article>;
                })}
              </div>
            </section>
          </section>
        )}
      </section>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        {navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.icon}</span>{item.label === "Medicamentos" ? "Remédios" : item.label}</button>)}
      </nav>

      {modal && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" onClick={() => setModal(null)} aria-label="Fechar">×</button>
            <p className="eyebrow">{modal === "member" ? "NOVO PERFIL" : "NOVA ROTINA"}</p>
            <h2 id="modal-title">{modal === "member" ? "Adicionar familiar" : "Adicionar medicamento"}</h2>
            <p>{modal === "member" ? "Crie um perfil separado para manter cada cuidado organizado." : "Copie os dados da receita e revise os horários com atenção."}</p>
            {modal === "member" ? (
              <form onSubmit={addMember}>
                <label>Nome completo<input name="name" placeholder="Ex.: Ana Souza" required autoFocus /></label>
                <label>Relação<input name="relationship" placeholder="Ex.: Avó, filho, meu perfil" required /></label>
                <button className="primary-button" type="submit">Adicionar à família</button>
              </form>
            ) : (
              <form onSubmit={addMedicine}>
                <div className="form-row"><label>Medicamento<input name="name" placeholder="Nome da embalagem" required autoFocus /></label><label>Dose<input name="dose" placeholder="Ex.: 50 mg" required /></label></div>
                <label>Para quem<select name="memberId" required>{state.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
                <label>Horários<input name="times" placeholder="08:00, 20:00" pattern="[0-9:, ]+" required /><small>Separe mais de um horário com vírgula.</small></label>
                <label>Orientação<input name="instruction" placeholder="Ex.: após o café da manhã" /></label>
                <div className="form-warning">Confira nome, dose e horários com a receita antes de salvar.</div>
                <button className="primary-button" type="submit">Salvar medicamento</button>
              </form>
            )}
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}
