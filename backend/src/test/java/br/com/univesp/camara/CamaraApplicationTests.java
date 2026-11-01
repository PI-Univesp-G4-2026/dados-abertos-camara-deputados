package br.com.univesp.camara;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "camara.admin.password=teste")
class CamaraApplicationTests {

	@Test
	void contextLoads() {
	}

}
