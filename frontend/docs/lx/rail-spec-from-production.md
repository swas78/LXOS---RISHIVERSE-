# RishiVerse rail — decompiled from 2gimeddcw1bn5.js

lockState: "auto" | "locked-open" | "locked-closed"
expanded (y) = lockState === "locked-open" || (lockState === "auto" && hovered)

onMouseEnter: if auto -> setTimeout(() => setHovered(true), 60)
onMouseLeave: if auto -> clearTimeout; setHovered(false) // NO close delay

animate width: y ? 220 : 60 // PUSHES (in flow)
transition: spring stiffness 200, damping 30, mass 0.9 // zeta ~1.12, overdamped

toggle button:
visible : y && !hasFlyout -> opacity-100, else pointer-events-none opacity-0
onClick : auto ? (hovered ? "locked-open" : "locked-closed") : "auto"
icon : auto ? Chevron(16) text-gray-500 : Lock(16) text-gray-300

row : group relative flex h-[40px] items-center rounded-2xl
pill : layoutId="active-pill" absolute inset-0 z-0 rounded-2xl bg-[#FFF1EB] (spring 300/30)
icon col : z-10 flex w-[44px] shrink-0 justify-center
icon : h-5 w-5 transition-colors duration-200
active #CA4317 | idle #C4CAD1 group-hover:#5A5F66
label wrap: animate width y?"auto":0, opacity +!!y; width .2s, opacity .15s
label : z-10 ml-1 text-sm font-medium whitespace-nowrap
active #CA4317 | idle #868C93 group-hover:#2F3337
tooltip : only when !y -> absolute left-full ml-2 rounded bg-black px-2 py-1 text-xs text-white
opacity-0 group-hover:opacity-100

list : flex flex-col gap-2
scroller : sidebar-scroll max-h-[58dvh] flex-1 overflow-y-auto px-2 pb-4
spacer : h-[16px] after the scroller
bottom : flex w-[60px] flex-col items-center gap-6 p-4 text-gray-300 // stays 60 always
effect : activeRef.scrollIntoView({block:"center", behavior:"smooth"}) on active change
