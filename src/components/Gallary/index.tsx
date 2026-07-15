import ModelMale from "@/assets/images/galeria-homem.jpg";
import ShoePurple from "@/assets/images/galeria-tenis-roxo.jpg";
import ModelFemale from "@/assets/images/galeria-modelo.jpg";
import ShoeColor from "@/assets/images/galeria-tenis-colorido.jpg";
import ShoeWhiteBlack from "@/assets/images/galeria-tenis-branco-e-preto.jpg";
import ShoeGray from "@/assets/images/galeria-tenis-cinza.jpg";
import { Overlay } from "../Overlay";
import { Button } from "../Button";

export const Gallery = () => {
    return (
        <div className="container">
            <section className="grid gap-3 md:gap-6 grid-cols-2 auto-rows-[220px] md:grid-cols-[repeat(4,1fr)] md:grid-rows-[repeat(3,300px)]">
                <div className="relative col-span-2 rounded-[2rem] overflow-hidden md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1">
                    <img src={ModelMale} alt="Modelo masculino" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12">
                        <Overlay title="Kripton One" subtitle="Estilo urbano com atitude" classname="inset-0 justify-center">
                            <Button variant="secondary">Feminino</Button>
                            <Button variant="secondary">Masculino</Button>
                        </Overlay>
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