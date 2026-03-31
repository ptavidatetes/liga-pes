"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

const [openSection, setOpenSection] = useState("");

const [jornadas, setJornadas] = useState(1);
const [selectedTeam1, setSelectedTeam1] = useState("");
const [selectedTeam2, setSelectedTeam2] = useState("");

const [events, setEvents] = useState<any[]>([]);

  // 🔥 AÑADIDO → mensajes visuales
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  // 🔥 AÑADIDO → equipo para añadir jugador como admin
  const [adminTeam, setAdminTeam] = useState(teams[0]);

  // 🔐 LOGIN / REGISTER
  const register = async () => {
  if (!password) return alert("Introduce contraseña");

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("team", team);

  if (existing && existing.length > 0) {
    return alert("Este equipo ya está registrado");
  }

  const { error } = await supabase.from("users").insert([
    { team, password }
  ]);

  if (error) return alert(error.message);

  alert("Registrado correctamente");
  setMode("login");
};

  const login = async () => {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("team", team);

  if (!data || data.length === 0) {
    return alert("Equipo no registrado");
  }

  if (data[0].password !== password) {
    return alert("Contraseña incorrecta");
  }

  setUser(data[0]);
  localStorage.setItem("session", JSON.stringify(data[0]));
};

  const logout = () => {
    localStorage.removeItem("session");
    setUser(null);
  };

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) setUser(JSON.parse(session));

    fetchPlayers();
    fetchOffers();
    fetchBudgets();
    fetchMatches();
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase.from("players").select("*");
    setPlayers(data || []);
  };

  const fetchOffers = async () => {
    const { data } = await supabase.from("offers").select("*");
    setOffers(data || []);
  };

  const fetchEvents = async (matchId: number) => {
  const { data } = await supabase
    .from("match_events")
    .select("*")
    .eq("match_id", matchId);

  setEvents(data || []);
};

  const fetchBudgets = async () => {
    const { data } = await supabase.from("budgets").select("*");
    setBudgets(data || []);
  };

  const getBudget = (teamName: string) => {
    const b = budgets.find((b) => b.team === teamName);
    return b ? b.money : 0;
  };

  // ➕ AÑADIR JUGADOR
  const addPlayer = async () => {
    if (!name || !price) return alert("Completa datos");

    const player = players.find(p => p.id == selectedPlayer);

team: player.team

    const { error } = await supabase.from("players").insert([
      {
        name,
        team: user.team,
        owner: user.team,
        price,
        position,
        on_market: false
      }
    ]);

    if (error) return alert(error.message);

    setName("");
    setPrice("");
    fetchPlayers();

    showMessage("Jugador añadido ⚽"); // AÑADIDO
  };

  // 🔥 AÑADIDO → ADMIN crea jugador en cualquier equipo
  const addPlayerAdmin = async () => {
    if (!name || !price) return;

    await supabase.from("players").insert([
      {
        name,
        team: adminTeam,
        owner: adminTeam,
        price,
        position,
        on_market: false
      }
    ]);

    fetchPlayers();
    showMessage("Jugador añadido por admin 👑");
  };

  // 🛒 MERCADO
  const toggleMarket = async (p: any) => {
    if (user.team !== "👑 ADMIN" && p.owner !== user.team) return;

    await supabase
      .from("players")
      .update({ on_market: !p.on_market })
      .eq("id", p.id);

    fetchPlayers();
    showMessage("Estado de mercado actualizado 🔄"); // AÑADIDO
  };

  // ❌ BORRAR
  const deletePlayer = async (p: any) => {
    if (user.team !== "👑 ADMIN") return;

    await supabase.from("players").delete().eq("id", p.id);
    fetchPlayers();

    showMessage("Jugador eliminado ❌"); // AÑADIDO
  };

  // 💰 HACER OFERTA
  const makeOffer = async (p: any) => {
    if (!offerAmount) return alert("Pon cantidad");

    if (getBudget(user.team) < parseInt(offerAmount)) {
      return alert("No tienes suficiente dinero");
    }

    const confirmOffer = confirm(`¿Ofrecer ${offerAmount} por ${p.name}?`);
    if (!confirmOffer) return;

    const { error } = await supabase.from("offers").insert([
      {
        player_id: p.id,
        from_team: user.team,
        to_team: p.owner,
        amount: parseInt(offerAmount),
      },
    ]);

    if (error) return alert(error.message);

    setOfferAmount("");
    fetchOffers();

    showMessage("Oferta enviada ✅"); // AÑADIDO
  };

// 📥 Cargar partidos
const fetchMatches = async () => {
  const { data } = await supabase.from("matches").select("*");
  setMatches(data || []);
};

// ➕ Crear partido
const createMatch = async () => {
  if (!selectedTeam1 || !selectedTeam2) {
    return alert("Selecciona ambos equipos");
  }

  if (selectedTeam1 === selectedTeam2) {
    return alert("No pueden ser el mismo equipo");
  }

  const { error } = await supabase.from("matches").insert([
    {
      team1: selectedTeam1,
      team2: selectedTeam2,
      jornada: jornadas
    }
  ]);

  if (error) return alert(error.message);

  fetchMatches();
  showMessage("Partido creado 🏆");
};

// ⚽ Añadir evento
const addEvent = async () => {
  if (!selectedMatch || !selectedPlayer) return;

  const player = players.find(p => p.id == selectedPlayer);

  const { error } = await supabase.from("match_events").insert([
    {
      match_id: selectedMatch.id,
      player_id: parseInt(selectedPlayer),
      team: player.team,
      type: eventType,
      minute: 0
    }
  ]);

  if (error) return alert(error.message);

  fetchEvents(selectedMatch.id); // 🔥 AÑADIDO
  showMessage("Evento añadido ⚽"); // 🔥 AÑADIDO
};

  // 📩 ACEPTAR / RECHAZAR
  const handleOffer = async (o: any, accept: boolean) => {
    if (accept) {
      await supabase
        .from("players")
        .update({
          owner: o.from_team,
          team: o.from_team,
          on_market: false,
        })
        .eq("id", o.player_id);

      const buyerMoney = getBudget(o.from_team) - o.amount;
      const sellerMoney = getBudget(o.to_team) + o.amount;

      await supabase.from("budgets").upsert([
        { team: o.from_team, money: buyerMoney },
        { team: o.to_team, money: sellerMoney }
      ]);
    }

    await supabase
      .from("offers")
      .update({ status: accept ? "accepted" : "rejected" })
      .eq("id", o.id);

    fetchPlayers();
    fetchOffers();
    fetchBudgets();

    showMessage(accept ? "Oferta aceptada ✅" : "Oferta rechazada ❌"); // AÑADIDO
  };

  const updateBudget = async () => {
    await supabase.from("budgets").upsert([
      { team: selectedTeam, money: parseInt(newBudget) }
    ]);

    setNewBudget("");
    fetchBudgets();

    showMessage("Presupuesto actualizado 💰"); // AÑADIDO
  };

  if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow w-80">
        <h1 className="text-xl font-bold mb-4 text-center">
          {mode === "login" ? "Login" : "Registro"}
        </h1>

        <select
          className="border p-2 rounded w-full mb-3"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        >
          {teams.map((t) => <option key={t}>{t}</option>)}
        </select>

        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 rounded w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === "login" ? (
          <button onClick={login} className="bg-blue-500 text-white w-full p-2 rounded">
            Entrar
          </button>
        ) : (
          <button onClick={register} className="bg-green-500 text-white w-full p-2 rounded">
            Registrarse
          </button>
        )}

        <p
          className="text-center mt-4 text-sm cursor-pointer text-blue-500"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          Cambiar modo
        </p>


        <p
  className="text-center mt-2 text-sm cursor-pointer text-red-500"
  onClick={async () => {

    // 🔒 comprobar que existe usuario
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("team", team);

    if (!data || data.length === 0) {
      return alert("Equipo no encontrado");
    }

    // 🔐 pedir contraseña actual
    const currentPass = prompt("Introduce tu contraseña actual");

    if (data[0].password !== currentPass) {
      return alert("Contraseña incorrecta ❌");
    }

    // confirmar cambio
    const confirmChange = confirm("¿Seguro que quieres cambiar la contraseña?");
    if (!confirmChange) return;

    // nueva contraseña
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
      </div>
    </div>
  );
}

  const myPlayers = players.filter(p => p.owner === user.team);
  const market = players.filter(p => p.on_market);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-4">⚽ Liga Manager</h1>
      <div className="flex gap-2 mb-6">

  <button
    onClick={() => setTab("equipo")}
    className={`px-3 py-1 rounded ${tab==="equipo" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    Equipo
  </button>

  <button
    onClick={() => setTab("mercado")}
    className={`px-3 py-1 rounded ${tab==="mercado" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    Mercado
  </button>

  <button
    onClick={() => setTab("ofertas")}
    className={`px-3 py-1 rounded ${tab==="ofertas" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    Ofertas
  </button>

  {user.team === "👑 ADMIN" && (
    <button
      onClick={() => setTab("partidos")}
      className={`px-3 py-1 rounded ${tab==="partidos" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
    >
      Partidos
    </button>
  )}

  {user.team === "👑 ADMIN" && (
  <button
    onClick={() => setTab("admin")}
    className={`px-3 py-1 rounded ${tab==="admin" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
  >
    Admin
  </button>
)}

</div>

      {/* 🔥 AÑADIDO → MENSAJE */}
      {message && (
        <div className="bg-green-200 text-center p-2 rounded mb-4">
          {message}
        </div>
      )}

      <p className="mb-4">💰 Presupuesto: {getBudget(user.team)}M</p>

      <div className="mb-4">
        <strong>{user.team}</strong>
        <button onClick={logout} className="ml-4 bg-red-500 text-white px-2 py-1 rounded">
          Salir
        </button>
      </div>

      {/* 👑 ADMIN */}
      {tab === "admin" && user.team === "👑 ADMIN" && (
        <>
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-bold mb-2">Gestionar presupuesto</h3>

            <select value={selectedTeam}
              onChange={(e)=>setSelectedTeam(e.target.value)}
              className="border p-2 mr-2">
              {teams.map(t => <option key={t}>{t}</option>)}
            </select>

            <input
              value={newBudget}
              onChange={(e)=>setNewBudget(e.target.value)}
              className="border p-2 mr-2 w-24"
            />

            <button onClick={updateBudget} className="bg-blue-500 text-white px-3 py-1 rounded">
              Guardar
            </button>
          </div>

          {/* 🔥 ADMIN VE TODOS LOS JUGADORES */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-bold mb-2">Todos los jugadores</h3>

            {players.map(p => (
              <div key={p.id} className="flex justify-between border-b py-1">
                <span>{p.name} ({p.team})</span>

                <button onClick={()=>deletePlayer(p)} className="bg-red-500 text-white px-2 rounded">
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {/* 🔥 ADMIN CREA JUGADORES */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-bold mb-2">Crear jugador (Admin)</h3>

            <select onChange={(e)=>setAdminTeam(e.target.value)} className="border p-2 mr-2">
              {teams.map(t => <option key={t}>{t}</option>)}
            </select>

            <button onClick={addPlayerAdmin} className="bg-green-500 text-white px-2 rounded">
              Crear
            </button>
          </div>
        </>
      )}

{/* ➕ FORMULARIO AÑADIR JUGADOR */}
<div className="bg-white p-4 rounded shadow mb-6 grid gap-2">
  <h3 className="font-bold">Añadir jugador</h3>

  <input
    className="border p-2 rounded"
    placeholder="Nombre"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />

  <input
    className="border p-2 rounded"
    placeholder="Precio"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
  />

  <select
    className="border p-2 rounded"
    value={position}
    onChange={(e) => setPosition(e.target.value)}
  >
    <option>Portero</option>
    <option>Defensa</option>
    <option>Centrocampista</option>
    <option>Delantero</option>
  </select>

  <button
    onClick={addPlayer}
    className="bg-blue-500 text-white p-2 rounded"
  >
    Añadir jugador
  </button>
</div>

{tab === "equipo" && (
  <div className="space-y-4">

    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-3">⚽ Tu equipo</h2>

      {myPlayers.map(p => (
        <div key={p.id} className="flex justify-between items-center border-b py-2">
          <span>
            {p.name} - {p.price} ({p.position})
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => toggleMarket(p)}
              className="bg-yellow-300 px-2 rounded text-sm"
            >
              {p.on_market ? "Quitar" : "Vender"}
            </button>

            {user.team === "👑 ADMIN" && (
              <button
                onClick={() => deletePlayer(p)}
                className="bg-red-500 text-white px-2 rounded text-sm"
              >
                X
              </button>
            )}
          </div>
        </div>
      ))}
    </div>

  </div>
)}

      {tab === "mercado" && (
  <div className="bg-white p-4 rounded-2xl shadow">
    <h2 className="text-xl font-bold mb-3">💰 Mercado</h2>

    {market.map(p => {
      const alreadyOffered = offers.some(
        o => o.player_id === p.id && o.from_team === user.team && o.status === "pending"
      );

      return (
        <div key={p.id} className="flex justify-between items-center border-b py-2">
          <span>{p.name} ({p.team}) - {p.price}</span>

          {alreadyOffered ? (
            <span className="text-sm text-gray-500">Oferta enviada</span>
          ) : (
            <div className="flex gap-2">
              <input
                value={offerAmount}
                onChange={(e)=>setOfferAmount(e.target.value)}
                className="border p-1 w-20 text-sm"
              />
              <button
                onClick={()=>makeOffer(p)}
                className="bg-blue-500 text-white px-2 rounded text-sm"
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
    
      {tab === "ofertas" && (
  <div className="bg-white p-4 rounded-2xl shadow">
    <h2 className="text-xl font-bold mb-3">📩 Ofertas</h2>

    {offers
      .filter(o => (o.to_team === user.team || user.team === "👑 ADMIN") && o.status === "pending")
      .map(o => {
        const player = players.find(p => p.id === o.player_id);

        return (
          <div key={o.id} className="border-b py-2">
            {o.from_team} ofrece {o.amount} por {player?.name}

            <div className="flex gap-2 mt-2">
              <button onClick={()=>handleOffer(o,true)} className="bg-green-500 text-white px-2 rounded text-sm">
                Aceptar
              </button>
              <button onClick={()=>handleOffer(o,false)} className="bg-red-500 text-white px-2 rounded text-sm">
                Rechazar
              </button>
            </div>
          </div>
        );
      })}
  </div>
)}

        {tab === "partidos" && (
  <div className="space-y-4">

    {/* CREAR PARTIDO */}
    <div className="bg-white p-4 rounded-2xl shadow">
      <h3 className="font-bold mb-2">Crear partido</h3>

      <div className="flex gap-2 flex-wrap">
        <input
          type="number"
          placeholder="Jornada"
          value={jornadas}
          onChange={(e) => setJornadas(parseInt(e.target.value))}
          className="border p-2 w-20"
        />

        <select
          className="border p-2"
          onChange={(e) => setSelectedTeam1(e.target.value)}
        >
          <option value="">Equipo 1</option>
          {teams.map(t => <option key={t}>{t}</option>)}
        </select>

        <select
          className="border p-2"
          onChange={(e) => setSelectedTeam2(e.target.value)}
        >
          <option value="">Equipo 2</option>
          {teams.map(t => <option key={t}>{t}</option>)}
        </select>

        <button
          onClick={createMatch}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Crear
        </button>
      </div>
    </div>

    {/* LISTA DE PARTIDOS */}
    <div className="bg-white p-4 rounded-2xl shadow">
      <h3 className="font-bold mb-2">Partidos creados</h3>

      {Object.entries(
        matches.reduce((acc: any, match) => {
          if (!acc[match.jornada]) acc[match.jornada] = [];
          acc[match.jornada].push(match);
          return acc;
        }, {})
      ).map(([jornada, partidos]: any) => (
        <div key={jornada} className="mb-4">
          <h3 className="font-bold text-blue-600">Jornada {jornada}</h3>

          {partidos.map((m: any) => (
            <div
              key={m.id}
              className={`border p-2 rounded mb-1 cursor-pointer ${
                selectedMatch?.id === m.id ? "bg-blue-100" : ""
              }`}
              onClick={() => {
                setSelectedMatch(m);
                fetchEvents(m.id);
              }}
            >
              {m.team1} vs {m.team2}
            </div>
          ))}
        </div>
      ))}
    </div>

    {/* DETALLE PARTIDO */}
    {selectedMatch && (
      <div className="bg-white p-4 rounded-2xl shadow">

        <h3 className="font-bold mb-2">
          {selectedMatch.team1} vs {selectedMatch.team2}
        </h3>

        {/* MARCADOR */}
        {(() => {
          const goalsTeam1 = events.filter(e =>
            e.type === "goal" && e.team === selectedMatch.team1
          ).length;

          const goalsTeam2 = events.filter(e =>
            e.type === "goal" && e.team === selectedMatch.team2
          ).length;

          return (
            <h2 className="text-xl font-bold mb-3">
              {selectedMatch.team1} {goalsTeam1} - {goalsTeam2} {selectedMatch.team2}
            </h2>
          );
        })()}

        {/* ACTA */}
        <div className="bg-gray-100 p-3 rounded mb-3">
          <h3 className="font-bold mb-2">Acta del partido</h3>

          {events.length === 0 && (
            <p className="text-sm text-gray-500">No hay eventos</p>
          )}

          {events.map(e => {
            const player = players.find(p => p.id === e.player_id);

            return (
              <div key={e.id} className="border-b py-1">
                {player?.name} - {e.type}
              </div>
            );
          })}
        </div>

        {/* ADMIN CONTROLES */}
        {user.team === "👑 ADMIN" && (
          <div className="space-y-3">

            <div className="flex gap-2 flex-wrap">
              <select
                className="border p-2"
                onChange={(e) => setSelectedPlayer(e.target.value)}
              >
                <option value="">Jugador</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.team})
                  </option>
                ))}
              </select>

              <select
                className="border p-2"
                onChange={(e) => setEventType(e.target.value)}
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
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Añadir evento
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await supabase
                    .from("matches")
                    .update({ status: "closed" })
                    .eq("id", selectedMatch.id);

                  fetchMatches();
                  showMessage("Partido cerrado 🏁");
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Guardar partido
              </button>

              <button
                onClick={async () => {
                  await supabase.from("matches").delete().eq("id", selectedMatch.id);
                  setSelectedMatch(null);
                  fetchMatches();
                  showMessage("Partido eliminado ❌");
                }}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Eliminar partido
              </button>
            </div>

          </div>
        )}

        {/* USUARIO NORMAL */}
        {user.team !== "👑 ADMIN" && (
          <p className="text-sm text-gray-500 mt-3">
            Solo visualización 👁
          </p>
        )}

      </div>
    )}

  </div>
)}
    </div>
  );
}