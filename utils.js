/*
 * Function Name: stringArrayToCharCodeArr
 * Input: an array of strings OR a single string
 * Output: an array of arrays of characters codes OR ...
 *
 * Arguments (1):
 *   [Array] string_array | An array of strings
 */
function stringArrayToCharCodeArr(string_array)
{
    let output_array = [];

    if (typeof string_array === 'string')
        string_array = [string_array];

    string_array.forEach(string =>
    {
        output_array.push(Array.from(
            string,
            character => character.charCodeAt()
        ));
    });

    return output_array;
}
