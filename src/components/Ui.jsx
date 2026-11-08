export const Head = ({ title, sub }) => (<><h1 className="wt">{title}</h1><p className="dim" style={{ marginBottom: 14 }}>{sub}</p></>);
export const Stat = ({ label, value, tone = "blue" }) => (<div className={"stat " + tone}><small>{label}</small><b>{value}</b></div>);
export const Panel = ({ title, children, right }) => (<section className="panel"><div className="ph"><h3>{title}</h3>{right}</div>{children}</section>);
export const Demo = () => <p className="demo">Demo data: iska backend abhi nahi hai, ye numbers asli nahi.</p>;
