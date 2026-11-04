package br.com.univesp.camara.etl;

import br.com.univesp.camara.client.CamaraClient;
import br.com.univesp.camara.model.Deputado;
import br.com.univesp.camara.model.Despesa;
import br.com.univesp.camara.repository.DeputadoRepository;
import br.com.univesp.camara.repository.DespesaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class EtlService {

    @Value("${camara.etl.votos-por-execucao:300}")
    private int votosPorExecucao;

    private final CamaraClient client;
    private final DeputadoRepository deputadoRepo;
    private final DespesaRepository despesaRepo;
    private final VotacaoEtlService votacaoEtlService;
    private final VotoEtlService votoEtlService;
    private final AtomicBoolean emExecucao = new AtomicBoolean();

    public EtlService(CamaraClient client,
                      DeputadoRepository deputadoRepo,
                      DespesaRepository despesaRepo, VotacaoEtlService votacaoEtlService, VotoEtlService votoEtlService) {
        this.client = client;
        this.deputadoRepo = deputadoRepo;
        this.despesaRepo = despesaRepo;
        this.votacaoEtlService = votacaoEtlService;
        this.votoEtlService = votoEtlService;
    }

    // Executa todos os dias às 3h da manhã
    @Scheduled(cron = "0 0 3 * * *")
    public void sincronizarTudo() {
        if (!emExecucao.compareAndSet(false, true)){
            System.out.println(">>> ETL: já existe uma sincronização em andamento, ignorando.");
            return;
        }
        try {
            executar("deputados", this::sincronizarDeputados);
            executar("votações", votacaoEtlService::sincronizarVotacoes);
            executar("votos", () -> votoEtlService.sincronizarVotos(votosPorExecucao));
            executar("despesas", this::sincronizarDespesasAnoAtual);
            System.out.println(">>> ETL: fim da sincronização diária");
        }finally {
            emExecucao.set(false);
        }

    }

    private void executar(String nome, Runnable etapa) {
        try {
            etapa.run();
        } catch (Exception e) {
            System.err.println(">>> ETL: falha na etapa " + nome + ": " + e.getMessage());
        }
    }

    @Transactional
    public void sincronizarDeputados() {
        System.out.println(">>> ETL: sincronizando deputados (isso pode demorar por causa do histórico)...");
        List<Deputado> deputados = client.buscarDeputados();

        int processados = 0;
        for (Deputado dep : deputados) {
            try {
                // Busca o histórico do deputado na API
                List<CamaraClient.HistoricoApi> historico = client.buscarHistoricoDeputado(dep.getId());

                // Filtra pela legislatura atual (57) e pega o evento mais recente
                String situacaoAtual = historico.stream()
                        .filter(h -> h.idLegislatura() != null && h.idLegislatura().equals(57))
                        .filter(h -> h.dataHora() != null)
                        .max(java.util.Comparator.comparing(CamaraClient.HistoricoApi::dataHora))
                        .map(CamaraClient.HistoricoApi::situacao)
                        .orElse(null); // Se não achar nada, fica nulo

                dep.setSituacao(situacaoAtual);
                deputadoRepo.save(dep);
                processados++;

                // Pausa para não bloquear a API da Câmara
                Thread.sleep(150);

            } catch (Exception e) {
                System.err.println("Erro no histórico do deputado " + dep.getId() + ": " + e.getMessage());
                deputadoRepo.save(dep); // Salva sem a situação para não perder o deputado
            }
        }
        System.out.println(">>> ETL: " + processados + " deputados sincronizados com histórico.");
    }

    @Transactional
    public void sincronizarDespesasDeputado(Long deputadoId, int ano) {
        Deputado dep = deputadoRepo.findById(deputadoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Deputado não encontrado: " + deputadoId));

        System.out.println(">>> ETL: buscando despesas do deputado " + deputadoId +
                " (" + dep.getNome() + ") - ano " + ano);

        // Remove despesas antigas do mesmo ano (evita duplicatas)
        despesaRepo.deleteByDeputadoIdAndAno(deputadoId, ano);

        List<Despesa> despesas = client.buscarDespesas(deputadoId, ano);
        despesas.forEach(d -> d.setDeputado(dep));
        despesaRepo.saveAll(despesas);

        System.out.println(">>> ETL: " + despesas.size() +
                " despesas salvas para o deputado " + deputadoId + ".");
    }

    @Transactional
    public void sincronizarDespesasAnoAtual() {
        int ano = Year.now().getValue();
        System.out.println(">>> ETL: sincronizando despesas de " + ano + " para todos os deputados...");
        List<Deputado> deputados = deputadoRepo.findAll();

        int total = 0;
        for (Deputado dep : deputados) {
            try {
                List<Despesa> despesas = client.buscarDespesas(dep.getId(), ano);
                despesaRepo.deleteByDeputadoIdAndAno(dep.getId(), ano);
                despesas.forEach(d -> d.setDeputado(dep));
                despesaRepo.saveAll(despesas);
                total += despesas.size();
                Thread.sleep(200);
            } catch (Exception e) {
                System.err.println("   - Falha no deputado " + dep.getId() + ": " + e.getMessage());
            }
        }
        System.out.println(">>> ETL: " + total + " despesas sincronizadas no total.");
    }
}