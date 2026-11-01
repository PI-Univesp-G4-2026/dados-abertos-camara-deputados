package br.com.univesp.camara.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairAndMigrateStrategy() {
        return flyway -> {
            // Realinha os checksums do banco com os arquivos locais
            flyway.repair();
            // Em seguida, aplica as migrações pendentes
            flyway.migrate();
        };
    }
}