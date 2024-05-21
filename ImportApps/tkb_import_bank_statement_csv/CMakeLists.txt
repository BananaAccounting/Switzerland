cmake_minimum_required(VERSION 3.16)

project(ch.banana.switzerland.import.tkb)
set(EXTENSION_ID "ch.banana.switzerland.import.tkb")

find_package(Qt6 COMPONENTS Core REQUIRED)
find_package(Qt6 COMPONENTS LinguistTools REQUIRED)

# The target ch.banana.switzerland.import.raiffeisen is used to build the extension to a sbaa package
# and set the source files for the IDE
add_custom_target(ch.banana.switzerland.import.tkb ALL
    COMMAND ${QT_CMAKE_EXPORT_NAMESPACE}::rcc -o ${EXTENSION_ID}.sbaa --binary ${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES ${EXTENSION_ID}.qrc
)