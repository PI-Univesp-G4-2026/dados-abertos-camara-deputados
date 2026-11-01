package br.com.univesp.camara.etl;

import br.com.univesp.camara.client.CamaraClient;
import br.com.univesp.camara.model.Legislatura;
import br.com.univesp.camara.repository.LegislaturaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LegislaturaEtlService {
    private final CamaraClient client;
    private final LegislaturaRepository legislaturaRepo;

    public LegislaturaEtlService(CamaraClient client, LegislaturaRepository legislaturaRepo) {
        this.client = client;
        this.legislaturaRepo = legislaturaRepo;
    }

    public void sincronizarLegislaturas() {
        System.out.println(">>> ETL: sincronizando legislaturas...");
        List<CamaraClient.LegislaturaApi> legislaturaApis = client.buscarLegislaturas();
        List<Legislatura> legislaturas = new ArrayList<>();

        for (CamaraClient.LegislaturaApi l : legislaturaApis) {
            if (l.dataInicio() == null) {
                System.err.println(" - legislatura " + l.id() + " sem data inicio, ignorado");
                continue;
            }
            Legislatura legislatura = new Legislatura();
            legislatura.setId(l.id());
            legislatura.setDataInicio(l.dataInicio());
            legislatura.setDataFim(l.dataFim());
            legislaturas.add(legislatura);
        }
        legislaturaRepo.saveAll(legislaturas);
        System.out.println(">>> ETL: " + legislaturas.size() + " legislaturas sincronizadas.");
    }
}
