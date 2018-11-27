import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


class Square extends React.Component {

	validateInput(evt) {
		let txt = evt.target.value;

		if(txt==="") {
			this.props.onChange(this.props.row, this.props.col, txt)
		} else {
			if(txt.match(/^\d$/))
				this.props.onChange(this.props.row, this.props.col, txt)
			else
      			this.props.onChange(this.props.row, this.props.col, this.props.val)
		}
	}

  render() {
    return (
      <input
      type="text"
      autoComplete="off"
      value = { this.props.val === 0 ? "" : ""+this.props.val}
      className="square"
      onChange = {(evt)=> this.validateInput(evt)}>
      </input>
    );
  }
}

class Board extends React.Component {

  renderSquare(i, j,  val) {
    return <Square
    className = "sudoku-cell"
    key = {(9*i+j)}
    val = {val}
    onChange = {this.props.onChange}
    row = {i}
    col = {j}
    />;
  }


  createCells(board){
  	let rows = [];

  	for(var i = 0; i< 9; i++){
  		let squares = [];
  		for(var j = 0; j< 9; j++){
  			squares.push(this.renderSquare(i, j , this.props.board[i][j] ));
  		}
  		rows.push(<div className = "sudoku-row" key = {i}>{squares}</div>);
  	}
  	return rows;
  }

  render() {

    return (
      <div className = {
      	this.props.unsolvable? "sudoku-board unsolvable" :
      	this.props.solved? "sudoku-board solved" : "sudoku-board"}>
      {this.createCells(this.props.board)}
      </div>
      );
  }
}

class Game extends React.Component {

	constructor(props){
		super(props)
		this.state = {
			board : Array(9).fill().map(() => Array(9).fill(0)),
			solved: false,
			unsolvable: false,
			status: "Enter a sudoku..."
		}
		this.handleCellChange = this.handleCellChange.bind(this);
	}

	handleCellChange(row, col, val){

		const newBoard = this.state.board.slice();

		newBoard[row][col] = (val==="") ? 0: parseInt(val, 10);

		this.setState({
			board: newBoard,
			solved: false,
			unsolvable: false,
			status: "Enter a sudoku..."
		});
	}

	reset(){
		this.setState({
			board : Array(9).fill().map(() => Array(9).fill(0)),
			solved: false,
			unsolvable: false,
			status: "Enter a sudoku..."
		});
	}

	attemptSolve(){
		if(this.state.solved) return;

		let clone = this.state.board.map(o => [...o]);

		if(validSudoku(clone, 0, 0)){
			let solution = solveBoard(clone, 0, 0);

			if(solution){
				this.setState({
					board:solution,
					solved : true,
					unsolvable: false,
					status: "Solved!"
				});
			} else {
				this.setState({
					board: this.state.board.map(o => [...o]),
					solved : false,
					unsolvable: true,
					status: "No solution exists :/"
				});
			}
		} else {
			this.setState({
					board: this.state.board.map(o => [...o]),
					solved : false,
					unsolvable: true,
					status: "No solution exists :/"
			});
		}


	}

  render() {
  	const currentBoard = this.state.board;

    return (

      <div className="game">
      	<div className = "game-header"> <h1> Sudoku! </h1></div>

        <div className="game-board">
          <Board board = {currentBoard}
          solved = {this.state.solved}
          unsolvable = {this.state.unsolvable}
          onChange = {this.handleCellChange}/>
        </div>

        <div className="game-info">
          <div className = "status">{this.state.status}</div>
        </div>

        <div className = "buttons">
        <button className = "solve-button" onClick= {() => this.attemptSolve()}> Solve</button>
        <button className = "reset-button" onClick= {() => this.reset()}> Reset</button>
        </div>

      </div>
    );
  }
}


// ======================================== SOLVER ===========================================

function rowContains(board, i, x, val){
	for(var j = 0; j< board[0].length; j++)
		if(j!==x && board[i][j]===val)
			return true;
	return false;
}

function colContains(board, x, j, val){
	for(var i = 0; i< board.length; i++)
		if(i!==x && board[i][j]===val)
			return true;
	return false;
}

function getCornerVal (index) {
	if(index<3)
		return 0;
	else if(index<6)
		return 3;
	else
		return 6;
}

function boxContains(board, i, j, val){
	const cornerRow = getCornerVal(i);
	const cornerCol = getCornerVal(j);

	for(var x = cornerRow; x<cornerRow+3; x++){
		for(var y = cornerCol; y<cornerCol+3; y++){
			if(x===i && y===j) continue;
			if(board[x][y]===val)
				return true;
		}
	}

	return false;
}


function validPlacement(board, i, j, val){
	return !rowContains(board, i, j, val) && !colContains(board, i, j, val) && !boxContains(board, i, j, val);
}


function solveBoard(board, i, j){

	if(board[i][j]>0){
		if(i===8 && j===8)
			return board;
		else if(j===8)
			return solveBoard(board, i+1, 0);
		else
			return solveBoard(board, i, j+1);
	}

	let x = null;

	for(var test = 1; test<=9; test++){
		if(validPlacement(board, i, j, test)){

			board[i][j] = test;

			if(i===8 && j===8)
				x = board;
			else if(j===8)
				x = solveBoard(board, i+1, 0);
			else
				x = solveBoard(board, i, j+1);

			if(x)
				return x;
			else
				board[i][j] = 0;
		}
	}
	return x;
}

function validSudoku(board, i, j){
	if(board[i][j]>0){
		if(!validPlacement(board, i, j, board[i][j])) return false;
	}

	if(i===8 && j===8)
		return true;
	else if(j===8)
		return validSudoku(board, i+1, 0);
	else
		return validSudoku(board, i, j+1);
}


// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
