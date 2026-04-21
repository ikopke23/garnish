import NavBar from "../components/NavBar";

type Props = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: Props) {
  return (
    <div className="page-and-navbar">
      <NavBar />
      <div className="main">{children}</div>
    </div>
  );
}
