import { useState, useEffect, useRef } from "react";

const SHAPES = [
  { id: "circle", label: "Circle", emoji: "🔵", color: "#FF6B6B", shadow: "#d94f4f" },
  { id: "star",   label: "Star",   emoji: "⭐", color: "#FFD93D", shadow: "#c9a800" },
  { id: "heart",  label: "Heart",  emoji: "❤️", color: "#FF8CC8", shadow: "#d45f9a" },
  { id: "square", label: "Square", emoji: "🟩", color: "#6BCB77", shadow: "#3d9e4a" },
  { id: "triangle",label:"Triangle",emoji:"🔺",color: "#9B89F5", shadow: "#6a58c4" },
];

const ANIMALS = [
  { name: "Bunny",   src: "🐰", likes: "circle" },
  { name: "Duck",    src: "🐥", likes: "star" },
  { name: "Puppy",   src: "🐶", likes: "heart" },
  { name: "Turtle",  src: "🐢", likes: "square" },
  { name: "Kitty",   src: "🐱", likes: "triangle" },
];

const REWARDS = ["⭐", "🌟", "✨", "🎉", "🏆", "🎈"];
const PRAISE = [
  "Amazing! You did it! 🎉",
  "Wow, you're so smart! ⭐",
  "Yay! Great job! 🌈",
  "Super duper! 🚀",
  "You're a star! 💫",
];

function playBeep(freq = 520, type = "sine", duration = 0.18, vol = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playSuccess() {
  [520, 660, 780].forEach((f, i) => setTimeout(() => playBeep(f, "triangle", 0.22, 0.25), i * 110));
}

function playWrong() {
  playBeep(220, "sawtooth", 0.15, 0.2);
}

function playTap() {
  playBeep(600, "sine", 0.1, 0.15);
}

function ShapeButton({ shape, onClick, disabled, popped }) {
  return (
    <button
      onClick={() => { playTap(); onClick(shape); }}
      disabled={disabled}
      style={{
        background: popped ? shape.color : "#fff",
        border: `4px solid ${shape.color}`,
        borderRadius: "20px",
        width: "100px",
        height: "100px",
        fontSize: "2.8rem",
        cursor: disabled ? "default" : "pointer",
        transform: popped ? "scale(1.18)" : "scale(1)",
        transition: "transform 0.2s, background 0.2s",
        boxShadow: popped ? `0 6px 0 ${shape.shadow}` : `0 4px 0 ${shape.shadow}`,
        outline: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {shape.emoji}
    </button>
  );
}

function StarBurst({ stars }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 999 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: s.x + "%",
            top: s.y + "%",
            fontSize: s.size + "px",
            animation: "floatUp 1.2s ease-out forwards",
            opacity: 1,
          }}
        >
          {s.char}
        </div>
      ))}
    </div>
  );
}

export default function SproutShapeGame() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | playing | correct | wrong | complete
  const [selected, setSelected] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [praise, setPraise] = useState("");
  const [stars, setStars] = useState([]);
  const [shakeAnimal, setShakeAnimal] = useState(false);
  const starRef = useRef(0);

  const animal = ANIMALS[round % ANIMALS.length];
  const correctShape = SHAPES.find((s) => s.id === animal.likes);

  const shuffledShapes = useRef([]);
  useEffect(() => {
    shuffledShapes.current = [...SHAPES].sort(() => Math.random() - 0.5);
  }, [round]);

  function spawnStars() {
    const newStars = Array.from({ length: 10 }, (_, i) => ({
      id: starRef.current++,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
      size: 24 + Math.random() * 20,
      char: REWARDS[Math.floor(Math.random() * REWARDS.length)],
    }));
    setStars((s) => [...s, ...newStars]);
    setTimeout(() => setStars([]), 1400);
  }

  function handleShapeClick(shape) {
    if (phase !== "playing") return;
    setSelected(shape.id);
    if (shape.id === animal.likes) {
      playSuccess();
      spawnStars();
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      setPhase("correct");
      setTimeout(() => {
        if (round + 1 >= ANIMALS.length) {
          setPhase("complete");
        } else {
          setRound((r) => r + 1);
          setSelected(null);
          setWrongId(null);
          setPhase("playing");
        }
        setScore((s) => s + 1);
      }, 1800);
    } else {
      playWrong();
      setWrongId(shape.id);
      setShakeAnimal(true);
      setPhase("wrong");
      setTimeout(() => {
        setWrongId(null);
        setShakeAnimal(false);
        setPhase("playing");
      }, 900);
    }
  }

  function restart() {
    setRound(0);
    setScore(0);
    setSelected(null);
    setWrongId(null);
    setPhase("playing");
    setStars([]);
  }

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          40%      { transform: translateY(-18px); }
          70%      { transform: translateY(-8px); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-10px); }
          40%     { transform: translateX(10px); }
          60%     { transform: translateX(-8px); }
          80%     { transform: translateX(8px); }
        }
        @keyframes pop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes wrongShake {
          0%,100% { transform: translateX(0) rotate(0); }
          25%     { transform: translateX(-6px) rotate(-4deg); }
          75%     { transform: translateX(6px) rotate(4deg); }
        }
        .shape-btn-wrong { animation: wrongShake 0.35s ease-in-out; }
        .animal-bounce   { animation: bounce 0.6s ease-in-out; }
        .animal-shake    { animation: shake 0.5s ease-in-out; }
      `}</style>

      <StarBurst stars={stars} />

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #FFF8E7 0%, #E8F8FF 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Nunito', 'Rounded Mplus 1c', 'Comic Sans MS', sans-serif",
        padding: "1.5rem",
        overflowX: "hidden",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2.2rem" }}>🌱</span>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#3d9e4a", letterSpacing: "-0.5px" }}>Sprout</span>
          <div style={{ marginLeft: "auto", background: "#FFD93D", borderRadius: "30px", padding: "4px 16px", fontWeight: 700, fontSize: "1.1rem", color: "#7a5800", boxShadow: "0 3px 0 #c9a800" }}>
            ⭐ {score}
          </div>
        </div>

        {/* Intro Screen */}
        {phase === "intro" && (
          <div style={{ textAlign: "center", maxWidth: "360px" }}>
            <div style={{ fontSize: "5rem", marginBottom: "1rem", animation: "bounce 1.2s infinite" }}>🌱</div>
            <h1 style={{ fontSize: "2rem", color: "#3d9e4a", fontWeight: 800, margin: "0 0 0.5rem" }}>Shape Garden!</h1>
            <p style={{ fontSize: "1.2rem", color: "#555", lineHeight: 1.6, margin: "0 0 2rem" }}>
              Help the animals find their favourite shapes! 🐰🐥🐶
            </p>
            <button onClick={() => { playTap(); setPhase("playing"); }} style={{
              background: "#6BCB77", color: "#fff", border: "none", borderRadius: "50px",
              padding: "18px 48px", fontSize: "1.5rem", fontWeight: 800, cursor: "pointer",
              boxShadow: "0 6px 0 #3d9e4a", transform: "scale(1)",
              transition: "transform 0.1s", letterSpacing: "0.5px",
            }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Let's Play! 🎉
            </button>
          </div>
        )}

        {/* Game Screen */}
        {(phase === "playing" || phase === "correct" || phase === "wrong") && (
          <div style={{ textAlign: "center", width: "100%", maxWidth: "420px" }}>

            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "1.5rem" }}>
              {ANIMALS.map((_, i) => (
                <div key={i} style={{
                  width: "14px", height: "14px", borderRadius: "50%",
                  background: i < round ? "#6BCB77" : i === round ? "#FFD93D" : "#ddd",
                  border: i === round ? "2px solid #c9a800" : "none",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>

            {/* Animal card */}
            <div style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 0 #e0e0e0",
              border: "3px solid #f0f0f0",
            }}>
              <div style={{ fontSize: "5.5rem", lineHeight: 1, marginBottom: "0.5rem",
                animation: phase === "correct" ? "bounce 0.6s" : shakeAnimal ? "shake 0.5s" : "none",
              }}>
                {animal.src}
              </div>
              <p style={{ fontSize: "1.3rem", color: "#444", fontWeight: 700, margin: "0.25rem 0 0" }}>
                {phase === "correct"
                  ? praise
                  : `${animal.name} loves the ${correctShape?.label}!`}
              </p>
              <p style={{ fontSize: "1rem", color: "#999", margin: "0.25rem 0 0" }}>
                {phase === "correct" ? "" : "Can you find it? 👇"}
              </p>
            </div>

            {/* Shape buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px" }}>
              {shuffledShapes.current.map((shape) => (
                <div
                  key={shape.id}
                  className={wrongId === shape.id ? "shape-btn-wrong" : ""}
                >
                  <ShapeButton
                    shape={shape}
                    onClick={handleShapeClick}
                    disabled={phase === "correct"}
                    popped={selected === shape.id && phase === "correct"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete screen */}
        {phase === "complete" && (
          <div style={{ textAlign: "center", maxWidth: "360px" }}>
            <div style={{ fontSize: "5rem", marginBottom: "0.5rem" }}>🏆</div>
            <h1 style={{ fontSize: "2.2rem", color: "#FF6B6B", fontWeight: 800, margin: "0 0 0.5rem" }}>
              You did it!
            </h1>
            <p style={{ fontSize: "1.3rem", color: "#555", margin: "0 0 0.5rem" }}>
              You got <strong style={{ color: "#3d9e4a" }}>{score}</strong> out of <strong>{ANIMALS.length}</strong> shapes right!
            </p>
            <div style={{ fontSize: "2.5rem", margin: "1rem 0 1.5rem", letterSpacing: "6px" }}>
              {Array.from({ length: score }, (_, i) => "⭐").join("")}
            </div>
            <button onClick={restart} style={{
              background: "#FF6B6B", color: "#fff", border: "none", borderRadius: "50px",
              padding: "16px 44px", fontSize: "1.4rem", fontWeight: 800, cursor: "pointer",
              boxShadow: "0 6px 0 #d94f4f",
            }}>
              Play Again! 🔄
            </button>
          </div>
        )}

        {/* Footer */}
        <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "#bbb", textAlign: "center" }}>
          Made for Sprout · Ages 3–5
        </p>
      </div>
    </>
  );
}