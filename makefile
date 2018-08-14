SOURCES=$(wildcard src/*.js)
OBJECTS=$(SOURCES:src/%=lib/%)

check-lib-folder:
	-mkdir -p lib

lib/%.js: src/%.js
	./node_modules/.bin/babel $< --source-root src -o $@

all: check-lib-folder $(OBJECTS)
