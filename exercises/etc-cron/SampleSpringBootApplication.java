package com.liferay.sample;

import com.liferay.client.extension.util.spring.boot3.client.ClientExtensionUtilSpringBootClientComponentScan;

import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@Import(ClientExtensionUtilSpringBootClientComponentScan.class)
@SpringBootApplication
public class SampleSpringBootApplication {

	public static void main(String[] args) {
		new SpringApplicationBuilder(
			SampleSpringBootApplication.class
		).web(
			WebApplicationType.NONE
		).run(
			args
		);
	}

}