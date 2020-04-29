const fs = require('fs')
const pdf = require('pdf-parse')

let dataBuffer = fs.readFileSync('./bill2.pdf')

async function main() {
	const data = await pdf(dataBuffer)

	const test = data.text.split('\n')

	const textIndex = test.indexOf('סה"כ לתשלום כולל מע"מ')

	const totalString = test[textIndex - 1]

	const regex = /\d+\.?\d*/
	const total = totalString.match(regex)[0]

	console.log('total:', total)
	
	

	
}

main()