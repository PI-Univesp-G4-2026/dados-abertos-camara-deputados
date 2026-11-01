package br.com.univesp.camara.client;

import br.com.univesp.camara.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory; // <-- IMPORT NOVO
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

@Component
public class CamaraClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${camara.api.base-url}")
    private String baseUrl;

    @Value("${camara.api.legislatura-atual}")
    private Integer legislaturaAtual;

    public CamaraClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 segundos (em milissegundos) para conectar
        factory.setReadTimeout(60000);    // 60 segundos (em milissegundos) para esperar a resposta
        this.restTemplate = new RestTemplate(factory);
    }

    public List<Deputado> buscarDeputados() {
        String url = baseUrl + "/deputados?idLegislatura=" + legislaturaAtual + "&itens=100&ordem=ASC&ordenarPor=nome";
        return buscarPaginado(url, this::paraDeputado);
    }

    private Deputado paraDeputado(JsonNode d) {
        Deputado dep = new Deputado();
        dep.setId(d.get("id").asLong());
        dep.setNome(d.get("nome").asText());
        dep.setNomeEleitoral(d.path("nomeEleitoral").asText(null));
        dep.setSiglaPartido(d.path("siglaPartido").asText(null));
        dep.setSiglaUf(d.path("siglaUf").asText(null));
        dep.setUrlFoto(d.path("urlFoto").asText(null));
        dep.setEmail(d.path("email").asText(null));
        dep.setLegislatura(legislaturaAtual);
        return dep;
    }

    public List<Despesa> buscarDespesas(Long deputadoId, int ano) {
        String url = baseUrl + "/deputados/" + deputadoId + "/despesas"
                + "?idLegislatura=" + legislaturaAtual
                + "&ano=" + ano
                + "&itens=100&ordem=ASC&ordenarPor=mes";
        return buscarPaginado(url, this::paraDespesa);
    }

    private Despesa paraDespesa(JsonNode d) {
        Despesa despesa = new Despesa();
        despesa.setAno(d.path("ano").asInt());
        despesa.setMes(d.path("mes").asInt());
        despesa.setTipoDespesa(textOrNull(d, "tipoDespesa"));
        despesa.setCodDocumento(textOrNull(d, "codDocumento"));
        String dataStr = textOrNull(d, "dataDocumento");
        despesa.setDataDocumento(dataStr != null ? LocalDate.parse(dataStr.substring(0, 10)) : null);
        despesa.setValorDocumento(decimalOrNull(d, "valorDocumento"));
        despesa.setValorGlosa(decimalOrNull(d, "valorGlosa"));
        despesa.setValorLiquido(decimalOrNull(d, "valorLiquido"));
        despesa.setNomeFornecedor(textOrNull(d, "nomeFornecedor"));
        despesa.setCnpjCpfFornecedor(textOrNull(d, "cnpjCpfFornecedor"));
        return despesa;
    }

    public List<Votacao> buscarVotacoes(LocalDate inicio, LocalDate fim) {
        String url = baseUrl + "/votacoes?dataInicio=" + inicio + "&dataFim=" + fim
                + "&itens=100&ordem=ASC&ordenarPor=dataHoraRegistro";
        return buscarPaginado(url, this::paraVotacao);
    }

    private Votacao paraVotacao(JsonNode d) {
        Votacao votacao = new Votacao();
        votacao.setId(d.get("id").asText());
        String dataStr = textOrNull(d, "data");
        votacao.setData(dataStr != null ? LocalDate.parse(dataStr.substring(0, 10)) : null);
        String dataStrHora = textOrNull(d, "dataHoraRegistro");
        votacao.setDataHoraRegistro(dataStrHora != null ? LocalDateTime.parse(dataStrHora) : null);
        votacao.setDescricao(textOrNull(d, "descricao"));

        JsonNode aprov = d.path("aprovacao");
        votacao.setAprovacao(aprov.isMissingNode() || aprov.isNull() ? null : aprov.asInt() == 1);

        votacao.setSiglaOrgao(d.path("siglaOrgao").asText(null));
        votacao.setUri(d.path("uri").asText(null));
        votacao.setUriEvento(d.path("uriEvento").asText(null));
        votacao.setUriOrgao(d.path("uriOrgao").asText(null));

        String uriProp = textOrNull(d, "uriProposicaoObjeto");
        votacao.setUriProposicaoObjeto(uriProp);
        votacao.setProposicaoId(uriProp != null ? Long.valueOf(uriProp.substring(uriProp.lastIndexOf('/') + 1)) : null);
        votacao.setProposicaoObjeto(d.path("proposicaoObjeto").asText(null));
        return votacao;
    }

    public List<VotoApi> buscarVotos(String votacaoId) {
        String url = baseUrl + "/votacoes/" + votacaoId + "/votos";
        return buscarSemPaginacao(url, this::paraVoto);
    }

    public record VotoApi(Long deputadoId, String tipoVoto, String siglaPartido, LocalDateTime dataRegistro) {
    }

    private VotoApi paraVoto(JsonNode d) {
        JsonNode dep = d.path("deputado_");
        String dataStrRegistro = textOrNull(d, "dataRegistroVoto");
        return new VotoApi(
                dep.path("id").asLong(),
                textOrNull(d, "tipoVoto"),
                textOrNull(dep, "siglaPartido"),
                dataStrRegistro != null ? LocalDateTime.parse(dataStrRegistro) : null);
    }

    public record TemaApi(int cod, String nome) {
    }

    public List<TemaApi> buscarTemas() {
        String url = baseUrl + "/referencias/proposicoes/codTema";
        return buscarSemPaginacao(url, this::paraTema);
    }

    private TemaApi paraTema(JsonNode d) {
        return new TemaApi(
                Integer.parseInt(d.path("cod").asText()),
                textOrNull(d, "nome")
        );
    }

    public List<Long> buscarProposicoesDoTema(int cod) {
        String url = baseUrl + "/proposicoes?codTema=" + cod + "&itens=100" ;
        return buscarSeguindoLinks(url, d -> d.path("id").asLong());
    }

    public record LegislaturaApi(int id, LocalDate dataInicio, LocalDate dataFim){}

    public List<LegislaturaApi> buscarLegislaturas(){
        return buscarPaginado(baseUrl + "/legislaturas?itens=100", this::paraLegislatura);
    }

    private LegislaturaApi paraLegislatura(JsonNode d){
        String dataStrInicio = textOrNull(d, "dataInicio");
        String dataStrFim = textOrNull(d, "dataFim");
        return new LegislaturaApi(
                Integer.parseInt(d.path("id").asText()),
                dataStrInicio != null ? LocalDate.parse(dataStrInicio) : null,
                dataStrFim != null ? LocalDate.parse(dataStrFim) : null);
    }

    public record PartidoApi(int id, String sigla, String nome){}

    public List<PartidoApi> buscarPartidos(){
        return buscarPaginado(baseUrl + "/partidos?itens=100", this::paraPartido);
    }

    private PartidoApi paraPartido(JsonNode d){
        return new PartidoApi(
                d.path("id").asInt(),
                textOrNull(d, "sigla"),
                textOrNull(d, "nome")
        );
    }
    // =========================================================================
    // MÉTODOS DE BUSCA COM RETRY E PAGINAÇÃO
    // =========================================================================
    //Buscador refatorado
    private <T> List<T> buscarPaginado(String urlBase, Function<JsonNode, T> conversor) {
        List<T> resultado = new ArrayList<>();
        int pagina = 1;
        boolean temMais = true;

        while (temMais) {
            String separador = urlBase.contains("?") ? "&" : "?";
            String url = urlBase + separador + "pagina=" + pagina;
            try {
                String json = fazerRequisicaoComRetry(url);
                JsonNode root = mapper.readTree(json);
                JsonNode dados = root.get("dados");

                if (dados == null || dados.isEmpty()) {
                    break;
                }

                for (JsonNode item : dados) {
                    resultado.add(conversor.apply(item));
                }

                JsonNode links = root.get("links");
                temMais = false;
                if (links != null) {
                    for (JsonNode link : links) {
                        if ("next".equals(link.path("rel").asText())) {
                            temMais = true;
                            break;
                        }
                    }
                }
                pagina++;
                Thread.sleep(300); // Pausa para não sobrecarregar a API da Câmara

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                temMais = false;
            } catch (Exception e) {
                throw new IllegalStateException("Erro na página " + pagina + " de " + urlBase + ": " + e.getMessage(), e);
            }
        }
        return resultado;
    }

    private <T> List<T> buscarSemPaginacao(String url, Function<JsonNode, T> conversor) {
        List<T> resultado = new ArrayList<>();
        try {
            String json = fazerRequisicaoComRetry(url);
            JsonNode dados = mapper.readTree(json).path("dados");
            for (JsonNode item : dados) {
                resultado.add(conversor.apply(item));
            }
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao buscar " + url + ": " + e.getMessage(), e);
        }
        return resultado;
    }

    private <T> List<T> buscarSeguindoLinks(String urlInicial, Function<JsonNode, T> conversor){
        List<T> resultado = new ArrayList<>();
        String url = urlInicial;
        int paginas = 0;

        while (url != null && paginas < 1000){
            try {
                String json = fazerRequisicaoComRetry(url);
                JsonNode root = mapper.readTree(json);
                for (JsonNode item : root.path("dados")){
                    resultado.add(conversor.apply(item));
                }
                String proxima = null;
                for (JsonNode link : root.path("links")){
                    if ("next".equals(link.path("rel").asText())){
                        proxima = link.path("href").asText(null);
                        break;
                    }
                }
                url = proxima;
                paginas++;
                Thread.sleep(300);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e){
                throw new IllegalStateException("Erro ao buscar " + url + ": " + e.getMessage(), e);
            }
        }
        return resultado;
    }

    // =========================================================================
    // MÉTODO AUXILIAR DE RETRY
    // =========================================================================

    private String fazerRequisicaoComRetry(String url) {
        int maxTentativas = 3;
        long tempoEsperaMs = 3000; // 3 segundos

        for (int tentativa = 1; tentativa <= maxTentativas; tentativa++) {
            try {
                return restTemplate.getForObject(url, String.class);
            } catch (Exception e) {
                System.err.println(">>> Aviso: Falha na tentativa " + tentativa + " de " + maxTentativas + " para URL: " + url);
                System.err.println(">>> Motivo: " + e.getMessage());

                if (tentativa == maxTentativas) {
                    throw new IllegalStateException("Falha após " + maxTentativas + " tentativas. Última URL: " + url, e);
                }

                try {
                    Thread.sleep(tempoEsperaMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException("Execução interrompida durante a espera entre tentativas.", ie);
                }
            }
        }
        return null;
    }

    // Helpers para leitura segura de campos JSON
    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) return null;
        String text = value.asText();
        return text.isBlank() ? null : text;
    }

    private BigDecimal decimalOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) return null;
        try {
            return new BigDecimal(value.asText());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}