package br.com.univesp.camara.etl;

import br.com.univesp.camara.client.CamaraClient;
import br.com.univesp.camara.model.Partido;
import br.com.univesp.camara.repository.PartidoRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PartidoEtlService {
    private final CamaraClient client;
    private final PartidoRepository partidoRepo;

    public PartidoEtlService(CamaraClient client, PartidoRepository partidoRepo) {
        this.client = client;
        this.partidoRepo = partidoRepo;
    }

    public void sincronizarPartidos() {
        System.out.println(">>> ETL: sincronizando partidos...");
        List<CamaraClient.PartidoApi> partidoApis = client.buscarPartidos();
        List<Partido> partidos = new ArrayList<>();

        for (CamaraClient.PartidoApi p : partidoApis) {
            if (p.sigla() == null || p.nome() == null) {
                System.err.println(" - partido " + p.id() + " sem sigla/nome, ignorado");
                continue;
            }
            Partido partido = new Partido();
            partido.setId(p.id());
            partido.setSigla(p.sigla());
            partido.setNome(p.nome());
            partidos.add(partido);
        }
        partidoRepo.saveAll(partidos);
        System.out.println(">>> ETL: " + partidos.size() + " partidos sincronizadas.");
    }
}
