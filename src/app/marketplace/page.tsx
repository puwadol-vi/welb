"use client";

import { useState, useMemo } from "react";

const CATS = [
  "ทั้งหมด","อาหาร & เครื่องดื่ม","แฟชั่น & เสื้อผ้า",
  "ความงาม & สปา","ของแต่งบ้าน","ศิลปะ & งานฝีมือ",
  "อิเล็กทรอนิกส์","สุขภาพ & ออร์แกนิก","อื่น ๆ"
];

const SHOPS = [
  { id:1, name:"บ้านปันสุข", cat:"ศิลปะ & งานฝีมือ",
    desc:"งานฝีมือแฮนด์เมดจากวัสดุธรรมชาติ กระเป๋า เครื่องประดับ ของตกแต่งบ้านสุดพิเศษ",
    addr:"123 ถ.นิมมานเหมินท์ ซอย 7 ต.สุเทพ อ.เมือง เชียงใหม่ 50200",
    phone:"089-123-4567", fb:"baanpansukhCM", ig:"baanpansukh", line:"@baanpansukh",
    img:"https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=360&fit=crop" },
  { id:2, name:"อรุณกาแฟ", cat:"อาหาร & เครื่องดื่ม",
    desc:"กาแฟสดจากไร่ดอยสูง คัดสรรเมล็ดพันธุ์ดี บรรยากาศอบอุ่น เปิดทุกวัน 7:00–18:00",
    addr:"45/2 ถ.ราชดำเนิน ต.พระสิงห์ อ.เมือง เชียงใหม่ 50200",
    phone:"053-234-567", fb:"arunkafae", ig:"arun.kafae", line:"@arunkafae",
    img:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=360&fit=crop" },
  { id:3, name:"Siam Bloom", cat:"ความงาม & สปา",
    desc:"ผลิตภัณฑ์ดูแลผิวจากสมุนไพรไทย ออร์แกนิก 100% ไม่มีสารเคมีอันตราย",
    addr:"88 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    phone:"02-345-6789", fb:"siambloom.th", ig:"siambloom_official", line:"@siambloom",
    img:"https://images.unsplash.com/photo-1570194065650-d99fb4b38f90?w=600&h=360&fit=crop" },
  { id:4, name:"ผ้าทอลวดลาย", cat:"แฟชั่น & เสื้อผ้า",
    desc:"ผ้าทอมือจากชุมชนท้องถิ่น ลวดลายวัฒนธรรมไทย สีย้อมธรรมชาติทุกชิ้น",
    addr:"200 ถ.วัวลาย ต.หายยา อ.เมือง เชียงใหม่ 50100",
    phone:"081-456-7890", fb:"phatholailay", ig:"phatho_lailay", line:"@phatholailay",
    img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=360&fit=crop" },
  { id:5, name:"นาข้าวโฮม", cat:"สุขภาพ & ออร์แกนิก",
    desc:"ข้าวอินทรีย์จากนาสู่บ้านคุณ ข้าวหอมมะลิ ไรซ์เบอร์รี่ และข้าวกล้องคัดพิเศษ",
    addr:"10 หมู่ 3 ต.สันกำแพง อ.สันกำแพง เชียงใหม่ 50130",
    phone:"082-567-8901", fb:"nakhao.home", ig:"nakhao_home", line:"@nakhaohome",
    img:"https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&h=360&fit=crop" },
  { id:6, name:"The Lanna Loft", cat:"ของแต่งบ้าน",
    desc:"เฟอร์นิเจอร์สไตล์ล้านนาร่วมสมัย งานไม้แกะสลักประณีตจากช่างท้องถิ่น",
    addr:"362 ถ.เจริญประเทศ ต.ช้างคลาน อ.เมือง เชียงใหม่ 50100",
    phone:"053-678-901", fb:"thelannaloft", ig:"the_lanna_loft", line:"@lannaloft",
    img:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=360&fit=crop" },
];

const BLANK = { name:"", cat:"", desc:"", addr:"", phone:"", fb:"", ig:"", line:"", img:"" };

const inputCls = "w-full bg-[#161616] border border-[#252525] text-white px-[0.85rem] py-[0.65rem] rounded-lg text-[0.88rem] outline-none transition-colors duration-200 placeholder:text-[#333] focus:border-[#f7931a]";

export default function MarketplacePage() {
  const [shops, setShops]   = useState(SHOPS);
  const [q, setQ]           = useState("");
  const [cat, setCat]       = useState("ทั้งหมด");
  const [open, setOpen]     = useState<typeof SHOPS[0] | null>(null);
  const [showForm, setForm] = useState(false);
  const [fd, setFd]         = useState(BLANK);
  const [ok, setOk]         = useState(false);

  const list = useMemo(() => shops.filter(s => {
    const hit = (s.name + s.desc + s.addr).toLowerCase().includes(q.toLowerCase());
    return hit && (cat === "ทั้งหมด" || s.cat === cat);
  }), [shops, q, cat]);

  const set = (k: string, v: string) => setFd(f => ({ ...f, [k]: v }));
  const closeForm = () => { setForm(false); setOk(false); setFd(BLANK); };

  const submit = () => {
    if (!fd.name || !fd.cat || !fd.addr) return;
    const shop = {
      ...fd, id: Date.now(),
      img: fd.img || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=360&fit=crop"
    };
    setShops(p => [shop, ...p]);
    setOk(true);
    setTimeout(closeForm, 2200);
  };

  const canSubmit = fd.name && fd.cat && fd.addr;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeOv { from { opacity:0 } to { opacity:1 } }
        @keyframes slideIn { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }
        .anim-fadeOv  { animation: fadeOv  .2s ease }
        .anim-slideIn { animation: slideIn .3s cubic-bezier(.16,1,.3,1) }
        .anim-scaleIn { animation: scaleIn .25s cubic-bezier(.16,1,.3,1) }
        .anim-fadeUp  { animation: fadeUp  .4s ease both }
        select option { background:#161616; color:#fff }
      `}</style>

      <div className="min-h-screen bg-[#0d0d0d] text-white">

        {/* ── HERO ── */}
        <section className="text-center px-6 pt-10 pb-12 relative overflow-hidden">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(247,147,26,.13)_0%,transparent_68%)] pointer-events-none" />
          <h1 className="text-[clamp(2rem,5.5vw,3.8rem)] font-extrabold leading-[1.1] mb-3 tracking-[-0.02em]">
            WelB <span className="text-[#f7931a]">Marketplace</span>
          </h1>
          <p className="text-[0.95rem] text-[#777] mb-9">ค้นพบร้านค้าที่คุณรัก · ลงทะเบียนฟรี ไม่ต้องยืนยันตัวตน</p>
          <div className="inline-flex items-center bg-[#141414] border border-[#222] rounded-[14px] overflow-hidden">
            <div className="py-[1.1rem] px-[2.2rem] text-center">
              <span className="block text-[1.7rem] font-bold">{shops.length}+</span>
              <span className="block text-[0.75rem] text-[#f7931a] mt-px font-medium">ร้านค้า</span>
            </div>
            <div className="w-px h-[38px] bg-[#222] self-center" />
            <div className="py-[1.1rem] px-[2.2rem] text-center">
              <span className="block text-[1.7rem] font-bold">{CATS.length - 1}</span>
              <span className="block text-[0.75rem] text-[#f7931a] mt-px font-medium">หมวดหมู่</span>
            </div>
            <div className="w-px h-[38px] bg-[#222] self-center" />
            <div className="py-[1.1rem] px-[2.2rem] text-center">
              <span className="block text-[1.7rem] font-bold">No KYC</span>
              <span className="block text-[0.75rem] text-[#f7931a] mt-px font-medium">ลงทะเบียนฟรี</span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setForm(true)}
              className="bg-[#f7931a] text-black px-[1.35rem] py-[0.55rem] rounded-[9px] font-semibold text-[0.88rem] cursor-pointer transition-all duration-[180ms] whitespace-nowrap hover:bg-[#ffaa3a] hover:-translate-y-px"
            >
              + เพิ่มร้านค้าใหม่
            </button>
          </div>
        </section>

        {/* ── CONTROLS ── */}
        <div className="max-w-[1200px] mx-auto px-8 pb-8 sm:px-4">
          <div className="relative mb-[1.1rem]">
            <svg className="absolute left-[0.95rem] top-1/2 -translate-y-1/2 text-[#444] w-[17px] h-[17px] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="w-full bg-[#161616] border border-[#252525] text-white py-[0.85rem] pr-[0.9rem] pl-[2.85rem] rounded-[10px] text-[0.93rem] outline-none transition-colors duration-200 placeholder:text-[#3a3a3a] focus:border-[#f7931a]"
              placeholder="ค้นหาชื่อร้าน สินค้า หรือที่อยู่..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="flex gap-[0.45rem] flex-wrap">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`py-[0.38rem] px-[0.95rem] rounded-full text-[0.8rem] cursor-pointer transition-all duration-[180ms] whitespace-nowrap border ${
                  cat === c
                    ? "bg-[#f7931a]/[.12] border-[#f7931a] text-[#f7931a]"
                    : "bg-[#161616] border-[#252525] text-[#777] hover:border-[#f7931a]/30 hover:text-[#ccc]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="max-w-[1200px] mx-auto px-8 pb-20 sm:px-4">
          <div className="flex items-center justify-between mb-[1.1rem]">
            <span className="text-[0.8rem] text-[#444] tracking-[0.04em]">แสดง {list.length} ร้านค้า</span>
          </div>
          {list.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="text-[2.8rem] mb-4">🔍</div>
              <p className="text-[#555] mb-6">ไม่พบร้านค้าที่ค้นหา</p>
              <button
                onClick={() => setForm(true)}
                className="bg-[#f7931a] text-black px-[1.35rem] py-[0.55rem] rounded-[9px] font-semibold text-[0.88rem] cursor-pointer transition-all duration-[180ms] hover:bg-[#ffaa3a] hover:-translate-y-px"
              >
                + เพิ่มร้านค้าของคุณ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-4">
              {list.map((s, i) => (
                <div
                  key={s.id}
                  className="group bg-[#141414] border border-[#222] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-[220ms] hover:border-[#f7931a] hover:-translate-y-[3px] hover:shadow-[0_10px_35px_rgba(247,147,26,.12)] anim-fadeUp"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => setOpen(s)}
                >
                  <div className="h-[195px] overflow-hidden bg-[#111] relative">
                    <img
                      src={s.img} alt={s.name}
                      className="w-full h-full object-cover block transition-transform duration-[400ms] group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute top-[0.7rem] left-[0.7rem] bg-black/70 border border-[#333] text-[#bbb] text-[0.7rem] py-[0.22rem] px-[0.65rem] rounded-full backdrop-blur-[6px]">
                      {s.cat}
                    </div>
                  </div>
                  <div className="px-5 pt-4 pb-5">
                    <div className="text-[1.1rem] font-semibold text-white mb-[0.35rem]">{s.name}</div>
                    <div className="text-[0.8rem] text-[#777] leading-[1.6] mb-[0.7rem] line-clamp-2">{s.desc}</div>
                    <div className="text-[0.76rem] text-[#555] mb-[0.7rem] leading-[1.4]">📍 {s.addr}</div>
                    <div className="flex items-center justify-between pt-[0.7rem] border-t border-[#1e1e1e]">
                      <div className="flex gap-[0.3rem]">
                        {s.phone && <span className="py-[0.18rem] px-[0.55rem] rounded-[5px] text-[0.68rem] font-semibold bg-[#1c1c1c] border border-[#2a2a2a] text-[#666]">📞</span>}
                        {s.fb    && <span className="py-[0.18rem] px-[0.55rem] rounded-[5px] text-[0.68rem] font-semibold bg-[#1c1c1c] border border-[#1877f2]/40 text-[#1877f2]">f</span>}
                        {s.ig    && <span className="py-[0.18rem] px-[0.55rem] rounded-[5px] text-[0.68rem] font-semibold bg-[#1c1c1c] border border-[#e1306c]/40 text-[#e1306c]">◉</span>}
                        {s.line  && <span className="py-[0.18rem] px-[0.55rem] rounded-[5px] text-[0.68rem] font-semibold bg-[#1c1c1c] border border-[#06c755]/40 text-[#06c755]">L</span>}
                      </div>
                      <span className="text-[0.76rem] text-[#f7931a] font-medium">ดูร้าน →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SHOP DRAWER ── */}
        {open && (
          <div className="fixed inset-0 bg-black/[.78] z-[200] flex items-start justify-end anim-fadeOv" onClick={() => setOpen(null)}>
            <div className="w-[min(480px,100vw)] h-screen bg-[#0f0f0f] border-l border-[#1f1f1f] overflow-y-auto relative anim-slideIn" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-[0.9rem] right-[0.9rem] bg-black/[.72] border border-[#333] text-[#aaa] w-[33px] h-[33px] rounded-lg flex items-center justify-center cursor-pointer text-[0.85rem] backdrop-blur-[6px] transition-all duration-[180ms] hover:bg-[#1f1f1f] hover:text-white hover:border-[#555]"
                onClick={() => setOpen(null)}
              >✕</button>
              <img
                src={open.img} alt={open.name}
                className="w-full h-[270px] object-cover block brightness-[.88]"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="px-[1.65rem] py-[1.4rem]">
                <div className="inline-block bg-[#f7931a]/10 border border-[#f7931a]/[.28] text-[#f7931a] text-[0.72rem] py-[0.22rem] px-[0.75rem] rounded-full mb-[0.65rem]">
                  {open.cat}
                </div>
                <div className="text-[1.65rem] font-bold text-white leading-[1.2] mb-[0.7rem]">{open.name}</div>
                <div className="text-[0.88rem] text-[#888] leading-[1.7]">{open.desc}</div>

                <div className="h-px bg-[#1a1a1a] my-[1.1rem]" />

                <div className="flex gap-[0.7rem] items-start">
                  <span className="text-[1rem] mt-[2px]">📍</span>
                  <div>
                    <div className="text-[0.68rem] text-[#444] uppercase tracking-[0.08em] mb-[2px]">ที่อยู่ร้านค้า</div>
                    <div className="text-[0.88rem] text-[#ccc] leading-[1.5]">{open.addr}</div>
                  </div>
                </div>

                <div className="h-px bg-[#1a1a1a] my-[1.1rem]" />

                <div className="text-[0.68rem] text-[#444] uppercase tracking-[0.08em] mb-[0.65rem]">ช่องทางติดต่อ</div>
                <div className="flex flex-col gap-[0.45rem]">
                  {open.phone && (
                    <a href={`tel:${open.phone}`} className="flex items-center gap-[0.8rem] bg-[#161616] border border-[#222] rounded-[10px] py-[0.7rem] px-[0.95rem] no-underline transition-all duration-[180ms] hover:border-[#f7931a]/50 hover:bg-[#1b1b1b] text-inherit">
                      <div className="w-[30px] h-[30px] rounded-[7px] bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center text-[0.85rem] shrink-0 font-bold">📞</div>
                      <div>
                        <div className="text-[0.67rem] text-[#444] uppercase tracking-[0.06em]">โทรศัพท์</div>
                        <div className="text-[0.85rem] text-[#ccc] mt-px">{open.phone}</div>
                      </div>
                      <span className="text-[#333] ml-auto text-[0.8rem]">→</span>
                    </a>
                  )}
                  {open.fb && (
                    <a href={`https://facebook.com/${open.fb}`} target="_blank" rel="noreferrer" className="flex items-center gap-[0.8rem] bg-[#161616] border border-[#222] rounded-[10px] py-[0.7rem] px-[0.95rem] no-underline transition-all duration-[180ms] hover:border-[#f7931a]/50 hover:bg-[#1b1b1b] text-inherit">
                      <div className="w-[30px] h-[30px] rounded-[7px] bg-[#1877f2]/[.12] border border-[#1877f2]/30 text-[#1877f2] flex items-center justify-center text-[0.85rem] shrink-0 font-bold">f</div>
                      <div>
                        <div className="text-[0.67rem] text-[#444] uppercase tracking-[0.06em]">Facebook</div>
                        <div className="text-[0.85rem] text-[#ccc] mt-px">{open.fb}</div>
                      </div>
                      <span className="text-[#333] ml-auto text-[0.8rem]">→</span>
                    </a>
                  )}
                  {open.ig && (
                    <a href={`https://instagram.com/${open.ig}`} target="_blank" rel="noreferrer" className="flex items-center gap-[0.8rem] bg-[#161616] border border-[#222] rounded-[10px] py-[0.7rem] px-[0.95rem] no-underline transition-all duration-[180ms] hover:border-[#f7931a]/50 hover:bg-[#1b1b1b] text-inherit">
                      <div className="w-[30px] h-[30px] rounded-[7px] bg-[#e1306c]/[.12] border border-[#e1306c]/30 text-[#e1306c] flex items-center justify-center text-[0.85rem] shrink-0 font-bold">◉</div>
                      <div>
                        <div className="text-[0.67rem] text-[#444] uppercase tracking-[0.06em]">Instagram</div>
                        <div className="text-[0.85rem] text-[#ccc] mt-px">@{open.ig}</div>
                      </div>
                      <span className="text-[#333] ml-auto text-[0.8rem]">→</span>
                    </a>
                  )}
                  {open.line && (
                    <a href={`https://line.me/ti/p/${open.line}`} target="_blank" rel="noreferrer" className="flex items-center gap-[0.8rem] bg-[#161616] border border-[#222] rounded-[10px] py-[0.7rem] px-[0.95rem] no-underline transition-all duration-[180ms] hover:border-[#f7931a]/50 hover:bg-[#1b1b1b] text-inherit">
                      <div className="w-[30px] h-[30px] rounded-[7px] bg-[#06c755]/[.12] border border-[#06c755]/30 text-[#06c755] flex items-center justify-center text-[0.85rem] shrink-0 font-bold">L</div>
                      <div>
                        <div className="text-[0.67rem] text-[#444] uppercase tracking-[0.06em]">LINE</div>
                        <div className="text-[0.85rem] text-[#ccc] mt-px">{open.line}</div>
                      </div>
                      <span className="text-[#333] ml-auto text-[0.8rem]">→</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD SHOP MODAL ── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/[.82] z-[200] flex items-center justify-center p-4 anim-fadeOv" onClick={closeForm}>
            <div className="w-[min(580px,96vw)] max-h-[90vh] bg-[#0f0f0f] border border-[#222] rounded-[16px] overflow-y-auto relative anim-scaleIn" onClick={e => e.stopPropagation()}>
              {ok ? (
                <div className="text-center px-8 py-[3.5rem]">
                  <div className="w-16 h-16 rounded-full bg-[#f7931a]/10 border-2 border-[#f7931a] text-[#f7931a] text-[1.6rem] font-bold flex items-center justify-center mx-auto mb-[1.1rem]">✓</div>
                  <div className="text-[1.35rem] font-bold text-white mb-[0.45rem]">เพิ่มร้านค้าสำเร็จ!</div>
                  <div className="text-[0.85rem] text-[#777]">ร้านของคุณปรากฏบน WelB Marketplace แล้ว</div>
                </div>
              ) : (
                <>
                  <div className="px-[1.65rem] py-[1.4rem] border-b border-[#1a1a1a] flex items-start justify-between">
                    <div>
                      <div className="text-[1.25rem] font-bold text-white">ลงทะเบียนร้านค้า</div>
                      <div className="text-[0.78rem] text-[#f7931a] mt-[3px] font-medium">ไม่ต้องสมัครสมาชิก · ไม่ต้อง KYC · ฟรี 100%</div>
                    </div>
                    <button
                      onClick={closeForm}
                      className="bg-[#161616] border border-[#333] text-[#aaa] w-[33px] h-[33px] rounded-lg flex items-center justify-center cursor-pointer text-[0.85rem] transition-all duration-[180ms] hover:bg-[#1f1f1f] hover:text-white hover:border-[#555] shrink-0"
                    >✕</button>
                  </div>

                  <div className="px-[1.65rem] py-[1.4rem] flex flex-col gap-[0.9rem]">
                    <div className="grid grid-cols-2 gap-[0.85rem] sm:grid-cols-1">
                      <div className="flex flex-col gap-[0.3rem]">
                        <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">ชื่อร้านค้า <span className="text-[#f7931a]">*</span></label>
                        <input className={inputCls} placeholder="เช่น ร้านดอกไม้สด" value={fd.name} onChange={e => set("name", e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-[0.3rem]">
                        <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">หมวดหมู่ <span className="text-[#f7931a]">*</span></label>
                        <select className={inputCls} value={fd.cat} onChange={e => set("cat", e.target.value)}>
                          <option value="">เลือกหมวดหมู่...</option>
                          {CATS.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[0.3rem]">
                      <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">รายละเอียดสินค้า / บริการ</label>
                      <textarea className={`${inputCls} resize-y min-h-[72px] leading-[1.55]`} placeholder="อธิบายสินค้าและบริการของร้านคุณ..." value={fd.desc} onChange={e => set("desc", e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-[0.3rem]">
                      <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">ที่อยู่ร้านค้า <span className="text-[#f7931a]">*</span></label>
                      <input className={inputCls} placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" value={fd.addr} onChange={e => set("addr", e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-[0.3rem]">
                      <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">URL รูปสินค้าหลัก</label>
                      <input className={inputCls} placeholder="https://example.com/image.jpg" value={fd.img} onChange={e => set("img", e.target.value)} />
                    </div>

                    <div className="text-[0.7rem] text-[#444] uppercase tracking-[0.1em] py-[0.35rem] border-t border-[#1a1a1a] mt-[0.1rem]">
                      ช่องทางติดต่อ (ใส่อย่างน้อย 1 ช่อง)
                    </div>

                    <div className="grid grid-cols-2 gap-[0.85rem] sm:grid-cols-1">
                      <div className="flex flex-col gap-[0.3rem]">
                        <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">เบอร์โทรศัพท์</label>
                        <input className={inputCls} placeholder="0XX-XXX-XXXX" value={fd.phone} onChange={e => set("phone", e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-[0.3rem]">
                        <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">LINE ID</label>
                        <input className={inputCls} placeholder="@yourline" value={fd.line} onChange={e => set("line", e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[0.85rem] sm:grid-cols-1">
                      <div className="flex flex-col gap-[0.3rem]">
                        <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">Facebook Page</label>
                        <input className={inputCls} placeholder="page-username" value={fd.fb} onChange={e => set("fb", e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-[0.3rem]">
                        <label className="text-[0.7rem] text-[#555] uppercase tracking-[0.08em]">Instagram</label>
                        <input className={inputCls} placeholder="username (ไม่ต้องมี @)" value={fd.ig} onChange={e => set("ig", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="px-[1.65rem] py-[1.2rem] border-t border-[#1a1a1a] flex gap-[0.65rem] justify-end">
                    <button onClick={closeForm} className="bg-transparent text-[#aaa] border border-[#2e2e2e] px-[1.35rem] py-[0.55rem] rounded-[9px] font-medium text-[0.88rem] cursor-pointer transition-all duration-[180ms] hover:border-[#555] hover:text-white">
                      ยกเลิก
                    </button>
                    <button disabled={!canSubmit} onClick={submit} className="bg-[#f7931a] text-black px-[1.35rem] py-[0.55rem] rounded-[9px] font-semibold text-[0.88rem] cursor-pointer transition-all duration-[180ms] hover:bg-[#ffaa3a] hover:-translate-y-px disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-y-0">
                      เพิ่มร้านค้า
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
