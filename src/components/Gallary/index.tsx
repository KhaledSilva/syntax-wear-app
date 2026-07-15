import ModelMale from "@/assets/images/galeria-homem.jpg";
import ShoePurple from "@/assets/images/galeria-tenis-roxo.jpg";
import ModelFemale from "@/assets/images/galeria-modelo.jpg";
import ShoeColor from "@/assets/images/galeria-tenis-colorido.jpg";
import ShoeWhiteBlack from "@/assets/images/galeria-tenis-branco-e-preto.jpg";
import ShoeGray from "@/assets/images/galeria-tenis-cinza.jpg";

export const Gallery = () => {
    return (
        <div className="container">
            <section className="grid gap-3 md:gap-6 grid-cols-2 auto-rows-[220px] md:grid-cols-[repeat(4,1fr)] md:grid-rows-[repeat(3,300px)]">
                <div className="relative col-span-2 rounded-[2rem] overflow-hidden md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1">
                    <img src={ModelMale} alt="Modelo masculino" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12">
                        <div className="flex w-full max-w-[40rem] flex-col items-center justify-center text-center gap-4 md:gap-5 px-6">
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] md:tracking-[0.35em] text-white/90">
                                Krypton One
                            </span>

                            <h2 className="text-2xl md:text-3xl leading-tight md:leading-[1.05] text-white max-w-sm md:max-w-none">
                                Estilo urbano com atitude
                            </h2>

                            <div className="flex w-full  items-center gap-3 sm:flex-row sm:justify-center">
                                <button className="w-full max-w-[220px] sm:w-auto sm:min-w-[9rem] rounded-full border border-white px-0.5 md:px-8 py-2 md:py-3 text-sm text-white transition hover:bg-white/10 hover:font-semibold cursor-pointer">
                                    Feminino
                                </button>

                                <button className="w-full max-w-[220px] sm:w-auto sm:min-w-[9rem] rounded-full border border-white px-0.5 md:px-8 py-2.5 md:py-3 text-sm text-white transition hover:bg-white/10 hover:font-semibold cursor-pointer">
                                    Masculino
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="col-span-2 rounded-[2rem] overflow-hidden md:col-span-2 md:col-start-1 md:row-start-3">
                    <img src={ShoeWhiteBlack} alt="Tênis branco e preto" className="h-full w-full object-cover" />
                </div>

                <div className="col-start-1 row-start-3 row-span-2 rounded-[2rem] overflow-hidden md:col-span-1 md:col-start-3 md:row-start-2 md:row-span-2">
                    <img src={ModelFemale} alt="Modelo feminina" className="h-full w-full object-cover" />
                </div>

                <div className="col-start-2 row-start-3 rounded-[2rem] overflow-hidden md:col-span-1 md:col-start-4 md:row-start-2">
                    <img src={ShoeColor} alt="Tênis colorido" className="h-full w-full object-cover" />
                </div>

                <div className="col-start-2 row-start-4 rounded-[2rem] overflow-hidden md:col-span-1 md:col-start-4 md:row-start-3">
                    <img src={ShoeGray} alt="Tênis cinza" className="h-full w-full object-cover" />
                </div>

                <div className="col-span-2 rounded-[2rem] overflow-hidden md:col-start-3 md:col-span-2 md:row-start-1 md:row-span-1">
                    <img src={ShoePurple} alt="Tênis roxo" className="h-full w-full object-cover" />
                </div>
            </section>
        </div>
    )
}