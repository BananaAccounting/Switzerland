cmake_minimum_required(VERSION 3.16)

project(ch.banana.ch.invoice.ch10)
set(EXTENSION_ID "ch.banana.ch.invoice.ch10")

find_package(Qt6 COMPONENTS Core REQUIRED)
find_package(Qt6 COMPONENTS LinguistTools REQUIRED)

# The target invoiceapp is used to build the extension to a sbaa package
# and set the source files for the IDE
add_custom_target(invoiceapp ALL
    COMMAND ${QT_CMAKE_EXPORT_NAMESPACE}::rcc -o ${EXTENSION_ID}.sbaa --binary ${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES
        ${EXTENSION_ID}.qrc
        changelog.md
)
