cmake_minimum_required(VERSION 3.16)

project(ch.banana.switzerland.camt.v2)
set(EXTENSION_ID "ch.banana.switzerland.import.camt.v2")

if(APPLE)
    set(TEST_DIR "/Users/administrator/GitHub/BananaInternal/Switzerland/ImportApps/iso20022_camt_v2")
else()
    set(TEST_DIR "c://p/GitHub/BananaInternal/Switzerland/ImportApps/iso20022_camt_v2/")
endif()

find_package(Qt6 COMPONENTS Core REQUIRED)
find_package(Qt6 COMPONENTS LinguistTools REQUIRED)

# The target ch.banana.switzerland.camt.v2 is used to build the extension to a sbaa package
# and set the source files for the IDE
add_custom_target(ch.banana.switzerland.import.camt.v2 ALL
    COMMAND ${QT_CMAKE_EXPORT_NAMESPACE}::rcc -o ${EXTENSION_ID}.sbaa --binary ${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    SOURCES ${EXTENSION_ID}.qrc
)

add_custom_command(TARGET ch.banana.switzerland.import.camt.v2 POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
            ${CMAKE_SOURCE_DIR}/ch.banana.switzerland.import.camt.v2.sbaa
            ${TEST_DIR}/ch.banana.switzerland.import.camt.v2.sbaa)
