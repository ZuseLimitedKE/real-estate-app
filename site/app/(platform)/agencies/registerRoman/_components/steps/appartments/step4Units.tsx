interface CreatedApartmentUnitsProps {
    name: string,
    template_name: string,
    floor: number
}

export default function CreatedApartmentUnits(props: CreatedApartmentUnitsProps) {
    return (
        <section className="rounded-md p-2 bg-slate-100 space-y-1 min-w-[200px] overflow-y-auto max-h-[450px]">
            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Unit Name: </p>
                <p>{props.name}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Unit Template Name: </p>
                <p>{props.template_name}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Unit Floor: </p>
                <p>{props.floor}</p>
            </div>
        </section>
    );
}