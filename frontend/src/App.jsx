import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ListaDeputados from './pages/ListaDeputados'
import FichaDeputado from './pages/FichaDeputado'
import DashboardPartidos from './pages/DashboardPartidos'
import Proposicoes from './pages/Proposicoes'

export default function App() {
  return (
      <BrowserRouter>
        <a href="#conteudo" className="skip-link">Ir para o conteúdo</a>
        <div id="conteudo">
          <Routes>
            <Route path="/" element={<ListaDeputados />} />
            <Route path="/deputados/:id" element={<FichaDeputado />} />
            <Route path="/partidos" element={<DashboardPartidos />} />
            <Route path="/proposicoes" element={<Proposicoes />} />
          </Routes>
        </div>
      </BrowserRouter>
  )
}