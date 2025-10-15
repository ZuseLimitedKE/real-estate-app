import { getUIForAmenity } from "@/app/(platform)/agencies/properties/[id]/components/overview";
import { AMENITIES } from "@/types/agent_dashboard";
import Image from "next/image";

interface ApartmentCreatedUnitTemplateProps {
    name: string,
    gross_unit_size: number,
    unit_value: number,
    images: string[],
    amenities: {
        bedrooms?: number | null,
        bathrooms?: number | null,
        balconies?: number | null,
        gym?: boolean,
        air_conditioning?: boolean,
        heating?: boolean,
        furnished?: boolean,
        laundry_in_unit?: boolean,
        dishwasher?: boolean,
        storage_space?: boolean,
        pet_friendly?: boolean,
        security_system?: boolean,
        elevator?: boolean,
        garden_yard?: boolean,
    }
}

export default function ApartmentCreatedUnitTemplate(props: ApartmentCreatedUnitTemplateProps) {
    return (
        <section className="rounded-md p-2 bg-slate-100 space-y-1 min-w-[200px] overflow-y-scroll max-h-[450px]">
            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Template Name: </p>
                <p>{props.name}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Gross unit size: </p>
                <p>{props.gross_unit_size}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Unit value (KSH): </p>
                <p>{props.unit_value}</p>
            </div>

            <section>
                <h4 className="font-bold">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                    {props.amenities.bedrooms && (
                        getUIForAmenity(AMENITIES.BEDROOM, props.amenities.bedrooms)
                    )}

                    {props.amenities.bathrooms && (
                        getUIForAmenity(AMENITIES.BATHROOM, props.amenities.bathrooms)
                    )}

                    {props.amenities.balconies && (
                        getUIForAmenity(AMENITIES.BALCONY, props.amenities.balconies)
                    )}

                    {props.amenities.gym && (
                        getUIForAmenity(AMENITIES.FITNESS)
                    )}

                    {props.amenities.air_conditioning && (
                        getUIForAmenity(AMENITIES.AIR_CONDITIONING)
                    )}

                    {props.amenities.heating && (
                        getUIForAmenity(AMENITIES.HEATING)
                    )}

                    {props.amenities.furnished && (
                        getUIForAmenity(AMENITIES.FURNISHED)
                    )}

                    {props.amenities.laundry_in_unit && (
                        getUIForAmenity(AMENITIES.LAUNDRY)
                    )}

                    {props.amenities.dishwasher && (
                        getUIForAmenity(AMENITIES.DISHWASHER)
                    )}

                    {props.amenities.storage_space && (
                        getUIForAmenity(AMENITIES.STORAGE)
                    )}

                    {props.amenities.pet_friendly && (
                        getUIForAmenity(AMENITIES.PET_FRIENDLY)
                    )}

                    {props.amenities.security_system && (
                        getUIForAmenity(AMENITIES.SECURITY)
                    )}

                    {props.amenities.elevator && (
                        getUIForAmenity(AMENITIES.ELEVATOR)
                    )}

                    {props.amenities.garden_yard && (
                        getUIForAmenity(AMENITIES.GARDEN)
                    )}
                </div>
            </section>

            <section>
                <h4 className="font-bold">Unit Images</h4>
                <div className="flex overflow-x-scroll relative gap-4">
                    {props.images.map((i, index) => (
                        <Image
                            key={index}
                            src={i}
                            width={500}
                            height={500}
                            alt={`${props.name} image ${index}`}
                            className="object-cover w-1/2 min-w-[200px]"
                        />
                    ))}
                </div>
            </section>


        </section>
    );
}