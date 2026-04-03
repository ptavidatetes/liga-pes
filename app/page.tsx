"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Home as HomeIcon, ShoppingCart, Mail, Trophy, BarChart2, BalloonIcon } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const teams = [
  "CD Parquesol","Cascata Do Imbui","Ptavidatetes FC","Pxxr Gvng FC","Graxt4r FC","Papello Fc","FC La Zona","Burgos CF","SD Recreativo de Geria","Izmir FC","Trebol FC","CTK FC","CD Boxeadores","Nástic de Tarragona","SD Merengues","Murciélagos FC","Leganitos FC","Vendaval Colchonero","The Angels FC","Barappalo CF","🌍 Equipo libre","👑 ADMIN"
];

export default function Home() {
  const [players, setPlayers] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [team, setTeam] = useState(teams[0]);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [position, setPosition] = useState("Delantero");
  const [offerAmount, setOfferAmount] = useState("");

  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [newBudget, setNewBudget] = useState("");

  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [eventType, setEventType] = useState("goal");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [tab, setTab] = useState("equipo");

  const [jornadas, setJornadas] = useState(1);
  const [selectedTeam1, setSelectedTeam1] = useState("");
  const [selectedTeam2, setSelectedTeam2] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [viewTeam, setViewTeam] = useState("");
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [adminTeam, setAdminTeam] = useState(teams[0]);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  // === TODAS LAS FUNCIONES ORIGINALES (sin tocar nada) ===
  const register = async () => {
    if (!password) return alert("Introduce contraseña");
    const { data: existing } = await supabase.from("users").select("*").eq("team", team);
    if (existing && existing.length > 0) return alert("Este equipo ya está registrado");
    const { error } = await supabase.from("users").insert([{ team, password }]);
    if (error) return alert(error.message);
    alert("Registrado correctamente");
    setMode("login");
  };

  const login = async () => {
    const { data } = await supabase.from("users").select("*").eq("team", team);
    if (!data || data.length === 0) return alert("Equipo no registrado");
    if (data[0].password !== password) return alert("Contraseña incorrecta");
    setUser(data[0]);
    localStorage.setItem("session", JSON.stringify(data[0]));
  };

  const logout = () => {
    localStorage.removeItem("session");
    setUser(null);
  };

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const parsedUser = JSON.parse(session);
      setUser(parsedUser);
      setViewTeam(parsedUser.team);
    }
    fetchPlayers();
    fetchOffers();
    fetchBudgets();
    fetchMatches();
    fetchAllEvents();
  }, []);

  const fetchPlayers = async () => { const { data } = await supabase.from("players").select("*"); setPlayers(data || []); };
  const fetchOffers = async () => { const { data } = await supabase.from("offers").select("*"); setOffers(data || []); };
  const fetchEvents = async (matchId: number) => { const { data } = await supabase.from("match_events").select("*").eq("match_id", matchId); setEvents(data || []); };
  const fetchAllEvents = async () => { const { data } = await supabase.from("match_events").select("*"); setAllEvents(data || []); };
  const fetchBudgets = async () => { const { data } = await supabase.from("budgets").select("*"); setBudgets(data || []); };
  const fetchMatches = async () => { const { data } = await supabase.from("matches").select("*"); setMatches(data || []); };

  const getStandings = () => { /* tu lógica original exacta */ 
    let table: any = {};
    teams.forEach(t => { if (t !== "👑 ADMIN") table[t] = { team: t, points: 0, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }; });
    matches.forEach(match => {
      const matchEvents = allEvents.filter(e => e.match_id === match.id);
      const goals1 = matchEvents.filter(e => e.type === "goal" && e.team === match.team1).length;
      const goals2 = matchEvents.filter(e => e.type === "goal" && e.team === match.team2).length;
      if (!table[match.team1] || !table[match.team2]) return;
      table[match.team1].played++; table[match.team2].played++;
      table[match.team1].goalsFor += goals1; table[match.team1].goalsAgainst += goals2;
      table[match.team2].goalsFor += goals2; table[match.team2].goalsAgainst += goals1;
      if (goals1 > goals2) { table[match.team1].points += 3; table[match.team1].wins++; table[match.team2].losses++; }
      else if (goals2 > goals1) { table[match.team2].points += 3; table[match.team2].wins++; table[match.team1].losses++; }
      else { table[match.team1].points += 1; table[match.team2].points += 1; table[match.team1].draws++; table[match.team2].draws++; }
    });
    return Object.values(table).sort((a: any, b: any) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  };

  const getPlayerStats = () => { /* tu lógica original exacta */ 
    let stats: any = {};
    players.forEach(p => stats[p.id] = { id: p.id, name: p.name, team: p.team, goals: 0, assists: 0, yellow: 0, red: 0 });
    allEvents.forEach(e => {
      if (!stats[e.player_id]) return;
      if (e.type === "goal") stats[e.player_id].goals++;
      if (e.type === "assist") stats[e.player_id].assists++;
      if (e.type === "yellow") stats[e.player_id].yellow++;
      if (e.type === "red") stats[e.player_id].red++;
    });
    return Object.values(stats);
  };

  const getBudget = (teamName: string) => { const b = budgets.find(b => b.team === teamName); return b ? b.money : 0; };

  const addPlayer = async () => { /* tu lógica original exacta */ 
    if (!name || !price) return alert("Completa datos");
    const { error } = await supabase.from("players").insert([{ name, team: user.team, owner: user.team, price, position, on_market: false }]);
    if (error) return alert(error.message);
    setName(""); setPrice(""); fetchPlayers(); showMessage("Jugador añadido ⚽");
  };

  const addPlayerAdmin = async () => { /* tu lógica original */ 
    if (!name || !price) return;
    await supabase.from("players").insert([{ name, team: adminTeam, owner: adminTeam, price, position, on_market: false }]);
    fetchPlayers(); showMessage("Jugador añadido por admin 👑");
  };

  const toggleMarket = async (p: any) => { /* tu lógica original */ 
    if (user.team !== "👑 ADMIN" && p.owner !== user.team) return;
    await supabase.from("players").update({ on_market: !p.on_market }).eq("id", p.id);
    fetchPlayers(); showMessage("Estado de mercado actualizado 🔄");
  };

  const deletePlayer = async (p: any) => { /* tu lógica original */ 
    if (user.team !== "👑 ADMIN") return;
    await supabase.from("players").delete().eq("id", p.id); fetchPlayers(); showMessage("Jugador eliminado ❌");
  };

  const editPlayer = async (p: any) => { /* tu lógica original */ 
    const newName = prompt("Nuevo nombre:", p.name); const newPrice = prompt("Nuevo precio:", p.price);
    if (!newName || !newPrice) return;
    await supabase.from("players").update({ name: newName, price: newPrice }).eq("id", p.id);
    fetchPlayers(); showMessage("Jugador actualizado ✏️");
  };

  const makeOffer = async (p: any) => { /* tu lógica original */ 
    if (!offerAmount) return alert("Pon cantidad");
    if (getBudget(user.team) < parseInt(offerAmount)) return alert("No tienes suficiente dinero");
    const confirmOffer = confirm(`¿Ofrecer ${offerAmount} por ${p.name}?`); if (!confirmOffer) return;
    const { error } = await supabase.from("offers").insert([{ player_id: p.id, from_team: user.team, to_team: p.owner, amount: parseInt(offerAmount) }]);
    if (error) return alert(error.message);
    setOfferAmount(""); fetchOffers(); showMessage("Oferta enviada ✅");
  };

  const createMatch = async () => { /* tu lógica original */ 
    if (!selectedTeam1 || !selectedTeam2) return alert("Selecciona ambos equipos");
    if (selectedTeam1 === selectedTeam2) return alert("No pueden ser el mismo equipo");
    const { error } = await supabase.from("matches").insert([{ team1: selectedTeam1, team2: selectedTeam2, jornada: jornadas }]);
    if (error) return alert(error.message);
    fetchMatches(); showMessage("Partido creado 🏆");
  };

  const addEvent = async () => { /* tu lógica original */ 
    if (!selectedMatch || !selectedPlayer) return;
    const player = players.find(p => p.id == selectedPlayer);
    const { error } = await supabase.from("match_events").insert([{ match_id: selectedMatch.id, player_id: parseInt(selectedPlayer), team: player.team, type: eventType, minute: 0 }]);
    if (error) return alert(error.message);
    fetchEvents(selectedMatch.id); showMessage("Evento añadido ⚽"); fetchAllEvents();
  };

  const handleOffer = async (o: any, accept: boolean) => { /* tu lógica original */ 
    if (accept) {
      await supabase.from("players").update({ owner: o.from_team, team: o.from_team, on_market: false }).eq("id", o.player_id);
      const buyerMoney = getBudget(o.from_team) - o.amount;
      const sellerMoney = getBudget(o.to_team) + o.amount;
      await supabase.from("budgets").upsert([{ team: o.from_team, money: buyerMoney }, { team: o.to_team, money: sellerMoney }]);
    }
    await supabase.from("offers").update({ status: accept ? "accepted" : "rejected" }).eq("id", o.id);
    fetchPlayers(); fetchOffers(); fetchBudgets();
    showMessage(accept ? "Oferta aceptada ✅" : "Oferta rechazada ❌");
  };

  const updateBudget = async () => { /* tu lógica original */ 
    await supabase.from("budgets").upsert([{ team: selectedTeam, money: parseInt(newBudget) }]);
    setNewBudget(""); fetchBudgets(); showMessage("Presupuesto actualizado 💰");
  };
    if (!user) {
    return (
      <div style={{ all: "unset" }}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-blue-950 to-emerald-950">

          <form className="form login-anim" style={{ alignItems: "center" }}>

            <div className="title">
              Bienvenido,<br />
              <span>Liga VXD</span>
            </div>

            <select
              className="input"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            >
              {teams.map((t) => <option key={t}>{t}</option>)}
            </select>

            <input
              type="password"
              placeholder="Contraseña"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === "login" ? (
              <button
                type="button"
                onClick={login}
                className="button-confirm"
              >
                Entrar → <br />
              </button>
            ) : (
              <button
                type="button"
                onClick={register}
                className="button-confirm"
              >
                Registrarse →
              </button>
            )}

            <p
              className="text-sm cursor-pointer text-blue-600"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              Cambiar modo
            </p>

            <p
              className="text-sm cursor-pointer text-red-500"
              onClick={async () => {
                const { data } = await supabase
                  .from("users")
                  .select("*")
                  .eq("team", team);

                if (!data || data.length === 0) {
                  return alert("Equipo no encontrado");
                }

                const currentPass = prompt("Introduce tu contraseña actual");

                if (data[0].password !== currentPass) {
                  return alert("Contraseña incorrecta ❌");
                }

                const newPass = prompt("Nueva contraseña");

                if (!newPass) return;

                await supabase
                  .from("users")
                  .update({ password: newPass })
                  .eq("team", team);

                alert("Contraseña actualizada ✅");
              }}
            >
              ¿Olvidaste tu contraseña?
            </p>

          </form>
        </div>
      </div>
    );
  }

  const myPlayers = players.filter(p => p.owner === viewTeam);
  const market = players.filter(p => p.on_market);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* HEADER PREMIUM */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 pt-14 pb-8 rounded-b-3xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-3">
            <div className="text-4xl">⚽</div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">Liga VXD</h1>
              <p className="text-emerald-200 text-sm font-medium -mt-1">{user.team}</p>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="bg-black/30 px-5 py-2 rounded-3xl flex items-center gap-2">
              <span className="text-emerald-300 text-xl">💰</span>
              <span className="font-black text-3xl">{getBudget(user.team)}M</span>
            </div>
            <button onClick={logout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl text-sm font-medium transition-all active:scale-95">Salir</button>
          </div>
        </div>
      </div>

      {message && <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl z-50">{message}</div>}

      <div className="flex-1 overflow-y-auto pb-24 px-5 pt-6 space-y-8">

                        {/* === PESTAÑA EQUIPO - ESTILO BRUTALISTA (corregido) === */}
{tab === "equipo" && (
  <div className="space-y-8">

    {/* Hero Stats Section - Sin Valor de Mercado */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-surface border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1">ESTADO DE LA PLANTILLA</p>
        <h2 className="text-4xl font-black font-headline text-emerald-400">
          {myPlayers.length} Jugadores
        </h2>
        <div className="w-full h-2 bg-zinc-800 mt-4 border border-black overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all" 
            style={{ width: `${Math.min((myPlayers.length / 22) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

<p></p>

      <div className="bg-secondary-container border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[120px]">VXD</span>
        </div>
        <p className="text-[10px] font-bold uppercase text-white/70 tracking-widest mb-1">FORMACIÓN ACTIVA</p>
        <h2 className="text-4xl font-black font-headline text-white italic">4-3-3 A</h2>
        <button className="mt-6 text-[10px] font-black uppercase text-white border-b-2 border-white/40 hover:border-white transition-colors">
          CAMBIAR TÁCTICA
        </button>
      </div>
    </div>

<p></p>

    {/* Formulario para crear jugador */}
    <div className="bg-surface border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-2xl mb-5 flex items-center gap-3">
        <span className="material-symbols-outlined"></span>
        AÑADIR NUEVO JUGADOR
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          className="border-2 border-black px-6 py-5 text-lg placeholder:text-[#C9C9C9] focus:outline-none focus:border-emerald-500"
          placeholder="Nombre del jugador"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
<div><div className="h-px bg-zinc-700 my-4"></div></div>
        <input
          className="bg-[#ffff] border-2 border-black px-6 py-5 text-lg placeholder:text-[#C9C9C9] focus:outline-none focus:border-emerald-500"
          placeholder="Precio (M)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
        />
        <div><div className="h-px bg-zinc-700 my-4"></div></div>
        <select
          className="bg-white border-2 border-black px-6 py-5 text-lg text-black focus:outline-none focus:border-emerald-500"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          <option>Portero</option>
          <option>Defensa</option>
          <option>Centrocampista</option>
          <option>Delantero</option>
        </select>
      </div>

      <div><div className="h-px bg-zinc-700 my-4"></div></div>
      {user.team === "👑 ADMIN" && (
        <select
          className="w-full bg-white border-2 border-black px-6 py-5 text-lg text-black mb-6 focus:outline-none focus:border-emerald-500"
          value={adminTeam}
          onChange={(e) => setAdminTeam(e.target.value)}
        >
          {teams.map(t => <option key={t}>{t}</option>)}
        </select>
      )}

      <button
        onClick={user.team === "👑 ADMIN" ? addPlayerAdmin : addPlayer}
        className="w-full bg-emerald-500 text-black py-5 font-black text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      >
        {user.team === "👑 ADMIN" ? "CREAR JUGADOR (ADMIN)" : "AÑADIR JUGADOR A MI EQUIPO"}
      </button>
    </div>

<p></p>

    {/* Selector de Equipo - Fondo blanco */}
    <div className="bg-surface border-3 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">VER PLANTILLA DE</p>
      <select
        value={viewTeam}
        onChange={(e) => setViewTeam(e.target.value)}
        className="w-full bg-white border-2 border-black text-black px-6 py-5 text-lg font-medium focus:outline-none focus:border-emerald-500"
      >
        {teams.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>

    {/* Lista de Jugadores */}
    <div className="grid grid-cols-1 gap-6">
      {players.filter((p: any) => p.owner === viewTeam).length === 0 ? (
        <div className="bg-surface border-2 border-black p-16 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-zinc-400">Este equipo aún no tiene jugadores.</p>
        </div>
      ) : (
        players
          .filter((p: any) => p.owner === viewTeam)
          .map((p: any) => {
            const posColor = 
              p.position === "Portero" ? "bg-yellow-500 text-black" :
              p.position === "Defensa" ? "bg-blue-600 text-white" :
              p.position === "Centrocampista" ? "bg-emerald-500 text-black" : "bg-red-500 text-white";

            return (
              <div 
                key={p.id} 
                className="group bg-surface-container border-2 border-black p-6 flex flex-col md:flex-row items-center gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-900 transition-colors"
              >
                
                {/* Foto sin balón */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 bg-zinc-800 border-2 border-black rounded-xl overflow-hidden" />
                  <span className={`${posColor} absolute -bottom-2 -right-2 text-[10px] font-black px-3 py-0.5 border-2 border-black`}>
                    {p.position?.slice(0, 3).toUpperCase() || "FWD"}
                  </span>
                </div>

                {/* Información del jugador */}
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-xl font-black font-headline uppercase leading-none tracking-tight">
                    {p.name}
                  </h4>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    {p.position || "Jugador"}
                  </p>
                </div>

                {/* Precio y Acciones */}
                <div className="flex flex-col items-center md:items-end min-w-[160px] gap-4">
                  <span className="text-emerald-400 font-black font-headline text-2xl">
                    €{p.price}M
                  </span>


                  {(user.team === viewTeam || user.team === "👑 ADMIN") && (
                    <button
                      onClick={() => toggleMarket(p)}
                      className="bg-zinc-800 text-[10px] font-black uppercase px-6 py-3 border-2 border-black hover:bg-emerald-500 hover:text-black transition-all"
                    >
                      {p.on_market ? "QUITAR VENTA" : "PONER EN VENTA"}
                    </button>
                  )}

                  {user.team === "👑 ADMIN" && (
                    <div className="flex gap-2">
                      <button onClick={() => editPlayer(p)} className="bg-blue-600 px-5 py-2 text-xs font-medium border-2 border-black">EDITAR</button>
                      <button onClick={() => deletePlayer(p)} className="bg-red-600 px-5 py-2 text-xs font-medium border-2 border-black">ELIMINAR</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
      )}
    </div>
  </div>
)}

                {/* === MERCADO === */}
        {tab === "mercado" && (
          <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
            <h2 className="text-2xl font-black tracking-tighter mb-6 flex items-center gap-3">
              💰 Mercado de Fichajes
            </h2>

            {market.length === 0 ? (
              <p className="text-center text-zinc-500 py-16">No hay jugadores en el mercado en este momento.</p>
            ) : (
              <div className="space-y-4">
                {market.map((p) => {
                  const alreadyOffered = offers.some(o => o.player_id === p.id && o.from_team === user.team && o.status === "pending");

                  return (
                    <div key={p.id} className="bg-zinc-800/70 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{p.name}</p>
                        <p className="text-sm text-zinc-400">{p.team} • {p.position} • {p.price}M</p>
                      </div>

                      {alreadyOffered ? (
                        <div className="text-emerald-400 font-medium text-sm bg-emerald-500/10 px-5 py-2 rounded-2xl">Oferta enviada</div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            placeholder="Cantidad"
                            className="bg-zinc-900 border border-white/10 w-28 text-center rounded-2xl py-3 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            onClick={() => makeOffer(p)}
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 px-8 py-3 rounded-2xl font-semibold active:scale-95 transition-all"
                          >
                            Ofertar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
                {/* === OFERTAS + ADMIN === */}
        {(tab === "ofertas" || (tab === "admin" && user.team === "👑 ADMIN")) && (
          <div className="space-y-8">
            {/* Gestión Admin */}
            {user.team === "👑 ADMIN" && (
              <>
                <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
                  <h3 className="font-black text-xl mb-4">💰 Actualizar Presupuesto</h3>
                  <div className="flex gap-3">
                    <select 
                      value={selectedTeam} 
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="bg-zinc-800 border border-white/10 rounded-2xl px-4 py-3 flex-1"
                    >
                      {teams.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="Nuevo monto"
                      className="bg-zinc-800 border border-white/10 rounded-2xl px-4 py-3 w-40"
                    />
                    <button onClick={updateBudget} className="bg-emerald-500 px-8 rounded-2xl font-semibold">Guardar</button>
                  </div>
                </div>

                {/* Crear jugador Admin */}
                <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
                  <h3 className="font-black text-xl mb-4">👑 Crear Jugador (Admin)</h3>
                  <select onChange={(e) => setAdminTeam(e.target.value)} className="bg-zinc-800 border border-white/10 rounded-2xl px-4 py-3 mb-4 w-full">
                    {teams.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button onClick={addPlayerAdmin} className="w-full bg-emerald-500 py-4 rounded-2xl font-black text-lg">Crear Jugador</button>
                </div>
              </>
            )}

            {/* Ofertas Recibidas */}
            {user.team !== "👑 ADMIN" && (
              <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
                <h2 className="text-2xl font-black tracking-tighter mb-6">📬 Ofertas Recibidas</h2>
                {offers.filter(o => o.to_team === user.team && o.status === "pending").length === 0 ? (
                  <p className="text-center text-zinc-500 py-12">No tienes ofertas pendientes.</p>
                ) : (
                  offers
                    .filter(o => o.to_team === user.team && o.status === "pending")
                    .map((o) => {
                      const player = players.find(p => p.id === o.player_id);
                      return (
                        <div key={o.id} className="bg-zinc-800/70 border border-white/5 rounded-2xl p-5 mb-4">
                          <p className="text-lg">
                            <span className="font-semibold">{o.from_team}</span> ofrece <span className="font-black text-emerald-400">{o.amount}M</span> por <span className="font-semibold">{player?.name}</span>
                          </p>
                          <div className="flex gap-3 mt-5">
                            <button onClick={() => handleOffer(o, true)} className="flex-1 bg-emerald-500 py-3.5 rounded-2xl font-semibold">Aceptar</button>
                            <button onClick={() => handleOffer(o, false)} className="flex-1 bg-red-600 py-3.5 rounded-2xl font-semibold">Rechazar</button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>
        )}
                {/* === PANEL ADMIN (solo visible cuando tab === "admin" y eres ADMIN) === */}
        {user.team === "👑 ADMIN" && tab === "admin" && (
          <div className="space-y-8">
            {/* Gestionar Presupuestos */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
              <h3 className="font-black text-2xl mb-6 flex items-center gap-3">
                💰 Gestionar Presupuestos
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="bg-zinc-800 border border-white/10 rounded-2xl px-6 py-5 text-lg flex-1 focus:outline-none focus:border-emerald-500"
                >
                  {teams.map(t => <option key={t}>{t}</option>)}
                </select>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="Nuevo presupuesto"
                  className="bg-zinc-800 border border-white/10 rounded-2xl px-6 py-5 text-lg w-full sm:w-52 focus:outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={updateBudget}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all font-black text-xl px-10 py-5 rounded-2xl"
                >
                  Actualizar
                </button>
              </div>
            </div>

            {/* Todos los Jugadores (Admin) */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
              <h3 className="font-black text-2xl mb-6">👥 Todos los Jugadores</h3>
              <div className="max-h-[420px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-zinc-800/70 border border-white/5 rounded-2xl p-5 group">
                    <div className="flex items-center gap-4">
                      <div className="text-emerald-400 font-mono text-sm bg-zinc-900 px-3 py-1 rounded-xl">
                        {p.position?.slice(0, 3) || "????"}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{p.name}</p>
                        <p className="text-sm text-zinc-400">{p.team} • {p.price}M</p>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => editPlayer(p)}
                        className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-2xl text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deletePlayer(p)}
                        className="bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-2xl text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crear Jugador como Admin */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
              <h3 className="font-black text-2xl mb-6 flex items-center gap-3">
                👑 Crear Jugador para cualquier equipo
              </h3>

              <div className="mb-5">
                <label className="text-sm text-zinc-400 block mb-2">Equipo</label>
                <select 
                  onChange={(e) => setAdminTeam(e.target.value)}
                  className="bg-zinc-800 border border-white/10 rounded-2xl px-6 py-5 w-full text-lg"
                >
                  {teams.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                <input
                  className="bg-zinc-800 border border-white/10 rounded-2xl px-6 py-5 text-lg"
                  placeholder="Nombre del jugador"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="bg-zinc-800 border border-white/10 rounded-2xl px-6 py-5 text-lg"
                  placeholder="Precio (en millones)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                />
                <select
                  className="bg-zinc-800 border border-white/10 rounded-2xl px-6 py-5 text-lg"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <option>Portero</option>
                  <option>Defensa</option>
                  <option>Centrocampista</option>
                  <option>Delantero</option>
                </select>
              </div>

              <button 
                onClick={addPlayerAdmin}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 py-6 rounded-3xl font-black text-2xl active:scale-[0.98] transition-all"
              >
                Crear Jugador
              </button>
            </div>
          </div>
        )}
                {/* === PARTIDOS === */}
        {tab === "partidos" && (
          <div className="space-y-6">
            {/* Crear Partido - Solo Admin */}
            {user.team === "👑 ADMIN" && (
              <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
                <h3 className="font-black text-xl mb-5 flex items-center gap-2">
                  🏟 Crear Nuevo Partido
                </h3>
                <div className="flex flex-wrap gap-3">
                  <input
                    type="number"
                    placeholder="Jornada"
                    value={jornadas}
                    onChange={(e) => setJornadas(parseInt(e.target.value) || 1)}
                    className="bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 w-28 text-center text-lg"
                  />
                  <select
                    className="bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 flex-1 text-lg"
                    onChange={(e) => setSelectedTeam1(e.target.value)}
                  >
                    <option value="">Equipo 1</option>
                    {teams.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select
                    className="bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 flex-1 text-lg"
                    onChange={(e) => setSelectedTeam2(e.target.value)}
                  >
                    <option value="">Equipo 2</option>
                    {teams.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button
                    onClick={createMatch}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 rounded-2xl font-black text-lg active:scale-95 transition-all"
                  >
                    Crear Partido
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Partidos */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
              <h2 className="text-2xl font-black tracking-tighter mb-6">📅 Partidos</h2>

              {matches.length === 0 ? (
                <p className="text-center text-zinc-500 py-12">No hay partidos creados todavía.</p>
              ) : (
                Object.entries(
                  matches.reduce((acc: any, match: any) => {
                    if (!acc[match.jornada]) acc[match.jornada] = [];
                    acc[match.jornada].push(match);
                    return acc;
                  }, {})
                ).map(([jornada, partidos]: any) => (
                  <div key={jornada} className="mb-8">
                    <div className="bg-zinc-800 text-emerald-400 font-black text-sm uppercase tracking-widest px-5 py-3 rounded-2xl mb-3">
                      Jornada {jornada}
                    </div>
                    <div className="space-y-3">
                      {partidos.map((m: any) => {
                        const matchEvents = allEvents.filter(e => e.match_id === m.id);
                        const g1 = matchEvents.filter(e => e.type === "goal" && e.team === m.team1).length;
                        const g2 = matchEvents.filter(e => e.type === "goal" && e.team === m.team2).length;

                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              if (selectedMatch?.id === m.id) {
                                setSelectedMatch(null);
                              } else {
                                setSelectedMatch(m);
                                fetchEvents(m.id);
                              }
                            }}
                            className={`bg-zinc-800/70 border ${selectedMatch?.id === m.id ? "border-emerald-500" : "border-white/5"} rounded-2xl p-5 cursor-pointer hover:border-emerald-500/50 transition-all`}
                          >
                            <div className="flex justify-between items-center text-lg font-semibold">
                              <span>{m.team1}</span>
                              <span className="text-2xl font-black tabular-nums">{g1} - {g2}</span>
                              <span>{m.team2}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detalle del Partido Seleccionado */}
            {selectedMatch && (
              <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
                <h3 className="text-2xl font-black mb-6">
                  {selectedMatch.team1} vs {selectedMatch.team2}
                </h3>

                {/* Marcador Grande */}
                {(() => {
                  const goals1 = events.filter(e => e.type === "goal" && e.team === selectedMatch.team1).length;
                  const goals2 = events.filter(e => e.type === "goal" && e.team === selectedMatch.team2).length;
                  return (
                    <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 rounded-3xl p-8 text-center mb-8">
                      <div className="text-7xl font-black tracking-tighter tabular-nums">
                        {goals1} - {goals2}
                      </div>
                      <p className="text-emerald-400 mt-2 text-sm font-medium">EN DIRECTO</p>
                    </div>
                  );
                })()}

                {/* Acta del Partido */}
                <div className="mb-8">
                  <h4 className="font-bold text-lg mb-4 text-emerald-400">Acta del Partido</h4>
                  <div className="bg-zinc-800/70 rounded-2xl p-5 min-h-[120px]">
                    {events.length === 0 ? (
                      <p className="text-zinc-500 text-center py-8">Aún no hay eventos en este partido.</p>
                    ) : (
                      events.map((e) => {
                        const player = players.find(p => p.id === e.player_id);
                        return (
                          <div key={e.id} className="py-2 border-b border-white/10 last:border-none flex justify-between">
                            <span>{player?.name}</span>
                            <span className="capitalize text-emerald-400">
                              {e.type === "goal" && "⚽ Gol"}
                              {e.type === "assist" && "🎯 Asistencia"}
                              {e.type === "yellow" && "🟨 Amarilla"}
                              {e.type === "red" && "🟥 Roja"}
                              {e.type === "sub_in" && "🔄 Entra"}
                              {e.type === "sub_out" && "🔄 Sale"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Controles Admin */}
                {user.team === "👑 ADMIN" && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                      <select
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                        className="bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 flex-1"
                      >
                        <option value="">Seleccionar jugador</option>
                        {players
                          .filter(p => p.team === selectedMatch.team1 || p.team === selectedMatch.team2)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.team})
                            </option>
                          ))}
                      </select>

                      <select
                        onChange={(e) => setEventType(e.target.value)}
                        className="bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 flex-1"
                      >
                        <option value="goal">⚽ Gol</option>
                        <option value="assist">🎯 Asistencia</option>
                        <option value="yellow">🟨 Amarilla</option>
                        <option value="red">🟥 Roja</option>
                        <option value="sub_in">🔄 Entra</option>
                        <option value="sub_out">🔄 Sale</option>
                      </select>

                      <button
                        onClick={addEvent}
                        className="bg-emerald-500 px-8 py-4 rounded-2xl font-semibold active:scale-95"
                      >
                        Añadir Evento
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          await supabase.from("matches").update({ status: "closed" }).eq("id", selectedMatch.id);
                          fetchMatches();
                          showMessage("Partido cerrado 🏁");
                        }}
                        className="flex-1 bg-emerald-500 py-4 rounded-2xl font-black text-lg"
                      >
                        Guardar y Cerrar Partido
                      </button>
                      <button
                        onClick={async () => {
                          await supabase.from("match_events").delete().eq("match_id", selectedMatch.id);
                          await supabase.from("matches").delete().eq("id", selectedMatch.id);
                          setSelectedMatch(null);
                          fetchMatches();
                          fetchAllEvents();
                          showMessage("Partido eliminado ❌");
                        }}
                        className="flex-1 bg-red-600 py-4 rounded-2xl font-black text-lg"
                      >
                        Eliminar Partido
                      </button>
                    </div>
                  </div>
                )}

                {user.team !== "👑 ADMIN" && (
                  <p className="text-center text-zinc-500 py-6">Solo los administradores pueden añadir eventos.</p>
                )}
              </div>
            )}
          </div>
        )}
                {/* === CLASIFICACIÓN === */}
        {tab === "clasificacion" && (
          <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="text-4xl">🏆</div>
              <h2 className="text-3xl font-black tracking-tighter">Clasificación</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-emerald-400 text-sm uppercase tracking-widest">
                    <th className="py-4 px-2 font-medium">#</th>
                    <th className="py-4 px-2 font-medium">Equipo</th>
                    <th className="py-4 px-2 text-center font-medium">Pts</th>
                    <th className="py-4 px-2 text-center font-medium">PJ</th>
                    <th className="py-4 px-2 text-center font-medium">GF</th>
                    <th className="py-4 px-2 text-center font-medium">GC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {getStandings().map((team: any, i: number) => (
                    <tr key={team.team} className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-2 font-black text-xl text-emerald-400">{i + 1}</td>
                      <td className="py-5 px-2 font-semibold text-lg">{team.team}</td>
                      <td className="py-5 px-2 text-center font-black text-2xl tabular-nums">{team.points}</td>
                      <td className="py-5 px-2 text-center text-zinc-400">{team.played}</td>
                      <td className="py-5 px-2 text-center text-emerald-400 tabular-nums">{team.goalsFor}</td>
                      <td className="py-5 px-2 text-center text-red-400 tabular-nums">{team.goalsAgainst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-xs text-zinc-500 mt-8">
              Ordenado por puntos • Desempate por diferencia de goles
            </p>
          </div>
        )}
                {/* === ESTADÍSTICAS === */}
        {tab === "estadisticas" && (
          <div className="space-y-8">
            {/* Máximos Goleadores */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">⚽</div>
                <h2 className="text-2xl font-black tracking-tighter">Máximos Goleadores</h2>
              </div>
              <div className="space-y-4">
                {getPlayerStats()
                  .sort((a: any, b: any) => b.goals - a.goals)
                  .slice(0, 10)
                  .map((p: any, i: number) => (
                    <div key={p.id} className="flex items-center justify-between bg-zinc-800/70 border border-white/5 rounded-2xl px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-black text-lg">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-zinc-400">{p.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-black text-emerald-400 tabular-nums">{p.goals}</span>
                        <span className="text-xs text-emerald-400 block">goles</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Asistencias */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🎯</div>
                <h2 className="text-2xl font-black tracking-tighter">Mejores Asistentes</h2>
              </div>
              <div className="space-y-4">
                {getPlayerStats()
                  .sort((a: any, b: any) => b.assists - a.assists)
                  .slice(0, 10)
                  .map((p: any, i: number) => (
                    <div key={p.id} className="flex items-center justify-between bg-zinc-800/70 border border-white/5 rounded-2xl px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center font-black text-lg">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-zinc-400">{p.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-black text-cyan-400 tabular-nums">{p.assists}</span>
                        <span className="text-xs text-cyan-400 block">asistencias</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Tarjetas */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🟨🟥</div>
                <h2 className="text-2xl font-black tracking-tighter">Tarjetas</h2>
              </div>
              <div className="space-y-4">
                {getPlayerStats()
                  .sort((a: any, b: any) => (b.red * 2 + b.yellow) - (a.red * 2 + a.yellow))
                  .slice(0, 10)
                  .map((p: any, i: number) => (
                    <div key={p.id} className="flex items-center justify-between bg-zinc-800/70 border border-white/5 rounded-2xl px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center font-black text-lg">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-zinc-400">{p.team}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-lg">
                        <span>🟨 <span className="font-black text-yellow-400">{p.yellow}</span></span>
                        <span>🟥 <span className="font-black text-red-500">{p.red}</span></span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BARRA INFERIOR (exacta a la que te gusta, solo con estilo mejorado) */}
      <div style={{position: "fixed", bottom: 0, left: 0, width: "100%", background: "#18181b", borderTop: "1px solid #27272a", zIndex: 9999}}>
        <div style={{display: "flex", justifyContent: "space-around", padding: "12px 0"}}>
          <button onClick={() => setTab("equipo")}><HomeIcon size={26} /></button>
          <button onClick={() => setTab("mercado")}><ShoppingCart size={26} /></button>
          <button onClick={() => setTab("ofertas")}><Mail size={26} /></button>
          <button onClick={() => setTab("partidos")}><BalloonIcon size={26} /></button>
          <button onClick={() => setTab("clasificacion")}><Trophy size={26} /></button>
          <button onClick={() => setTab("estadisticas")}><BarChart2 size={26} /></button>
        </div>
      </div>
    </div>
  );
}