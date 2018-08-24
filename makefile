SOURCES=$(wildcard src/*.js)
OBJECTS=$(SOURCES:src/%=lib/%)

DEBUG?=
ifeq ("${DEBUG}","1")
WATCH=-w
endif

check-lib-folder:
	-mkdir -p lib

lib/%.js: src/%.js
	./node_modules/.bin/babel $< --source-root src -o $@

all: check-lib-folder $(OBJECTS)

tests:
	./node_modules/.bin/mocha $(WATCH) --compilers js:babel-core/register t/tests.js --reporter min -C
