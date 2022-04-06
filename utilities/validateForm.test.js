import {emailNullCheck, passwordNullCheck, passwordLengthCheck, passwordCharacterCheck} from './validateForm'

test('emailNullCheck', ()=>{
    let result = emailNullCheck('');
    expect(result).toBeFalsy();
    result = emailNullCheck('A');
    expect(result).toBeTruthy();
});

// test('passwordNullCheck', ()=>{
//     let result = passwordNullCheck('');
//     expect(result).toBe(false);
//     result = passwordNullCheck('A');
//     expect(result).toBe(true);
// });

// test('passwordLengthCheck', ()=>{
//     let result = passwordLengthCheck('ab');
//     expect(result).toBe(False);
//     result = passwordLengthCheck('as23fg455');
//     expect(result).toBe(True);
// });

// test('passwordCharacterCheck', ()=>{
//     let result = passwordCharacterCheck('as23fg455');
//     expect(result).toBe(False);
//     result = passwordCharacterCheck('S23fg455!');
//     expect(result).toBe(True);
// });