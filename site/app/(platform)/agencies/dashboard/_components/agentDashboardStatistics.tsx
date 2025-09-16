interface AgentDashboardStatisticsData {
    title: string,
    icon: React.ReactNode,
    value: string,
}

export default function AgentDashboardStatisticsItem(props: AgentDashboardStatisticsData) {
    return (
        <section className="p-4 border border-solid rounded-md border-slate-300">
            <header className="flex flex-row justify-between mb-2 font-bold text-sm">
                <h3>{props.title}</h3>
                {props.icon}
            </header>
            <p>{props.value}</p>
        </section>
    );
}