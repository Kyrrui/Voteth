const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('Web3');
const web3 = new Web3(ganache.provider());

const compiledVotethSubjectFactory = require('../ethereum/build/VotethSubjectFactory.json');
const compiledVotethSubject = require('../ethereum/build/VotethSubject.json');
const compiledVotethPost = require('../ethereum/build/VotethPost.json');
const compiledVotethComment = require('../ethereum/build/VotethComment.json');

let accounts;
let votethSubjectFactory;
let votethSubjectAddress;
let votethSubject;
let votethPostAddress;
let votethPost;
let votethCommentAddress;
let votethComment;

beforeEach(async () => {
	require('events').EventEmitter.defaultMaxListeners = 15;

	accounts = await web3.eth.getAccounts();

	votethSubjectFactory = await new web3.eth.Contract(JSON.parse(compiledVotethSubjectFactory.interface))
		.deploy({ data: compiledVotethSubjectFactory.bytecode })
		.send({ from: accounts[0], gas: '4000000'});
	await votethSubjectFactory.methods.addSubject('Cats', 'community for cat lovers').send({
		from: accounts[0],
		gas: '4000000'
	});

	[votethSubjectAddress] = await votethSubjectFactory.methods.getSubjects().call();
	votethSubject = await new web3.eth.Contract(
		JSON.parse(compiledVotethSubject.interface),
		votethSubjectAddress
	);
});

describe('Subjects', () => {
	it('deploys a factory and a subject', () => {
		assert.ok(votethSubjectFactory.options.address);
		assert.ok(votethSubject.options.address);
	});
});