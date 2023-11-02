.PHONY:init
init:
	yarn

.PHONY:dev
dev:
	web-ext run --devtools

.PHONY:build
build:
	web-ext build
