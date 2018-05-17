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
	require('events').EventEmitter.defaultMaxListeners = 100;

	// get our accounts
	accounts = await web3.eth.getAccounts();

	// Deploy a factory
	votethSubjectFactory = await new web3.eth.Contract(JSON.parse(compiledVotethSubjectFactory.interface))
		.deploy({ data: compiledVotethSubjectFactory.bytecode })
		.send({ from: accounts[0], gas: '4000000'});
	await votethSubjectFactory.methods.addSubject('Cats', 'community for cat lovers').send({
		from: accounts[0],
		gas: '4000000'
	});

	// Deploy a subject
	[votethSubjectAddress] = await votethSubjectFactory.methods.getSubjects().call();
	votethSubject = await new web3.eth.Contract(
		JSON.parse(compiledVotethSubject.interface),
		votethSubjectAddress
	);

	// Add a post
	await votethSubject.methods.addPost("Funny Cat", "catpic.jpg", "catlover999").send({
			from: accounts[0],
			gas: '4000000'
	});
	votethPostAddress = await votethSubject.methods.votethPosts(0).call();
	votethPost = await new web3.eth.Contract(
		JSON.parse(compiledVotethPost.interface),
		votethPostAddress
	);


});

describe('SubjectFactory', () => {
	it('deploys a factory and factory deploys a subject', async () => {
		assert.ok(votethSubjectFactory.options.address);
		assert.ok(votethSubject.options.address);
	});
});

describe('Subjects', () => {

	it('lets anyone add a post', async () => {
		assert.ok(votethPost.options.address);
	});

	it('has subject and description', async () => {
		const subject = await votethSubject.methods.subject().call();
		const description = await votethSubject.methods.description().call();
		assert.strictEqual(subject, 'Cats');
	});

	it('sets creator as admin', async () => {
		const isAdmin = await votethSubject.methods.adminList(accounts[0]).call();
		assert(isAdmin);
	});

	it('lets admin edit description', async () => {
		await votethSubject.methods.editDescription('community about cats').send({
			from: accounts[0]
		});
		const description = await votethSubject.methods.description().call();
		assert.strictEqual(description, 'community about cats');
	});

	it('lets creator add an admin', async () => {
		await votethSubject.methods.addAdmin(accounts[1]).send({
			from: accounts[0]
		});
		const isAdmin = await votethSubject.methods.adminList(accounts[1]).call();
		assert(isAdmin);
	});

	it('lets creator add an admin', async () => {
		await votethSubject.methods.addAdmin(accounts[1]).send({
			from: accounts[0]
		});
		const isAdmin = await votethSubject.methods.adminList(accounts[1]).call();
		assert(isAdmin);
	});

	it('prohibits non-admins from adding admins and editing the description', async () => {
		try {
			await votethSubject.methods.addAdmin(accounts[3]).send({
				from: accounts[2]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
		try {
			await votethSubject.methods.editDescription('lol').send({
				from: accounts[3]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});
});