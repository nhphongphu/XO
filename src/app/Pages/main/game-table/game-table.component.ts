import { Component, OnInit, QueryList, ViewChildren, Inject } from '@angular/core';

import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';


import { OpponentType, MapSize } from '../../../GameMode';
import { CellImp } from '../../cell/CellImp';
import { Player } from '../../../Player';
import { CellComponent } from '../../cell/cell.component'

// Game Manager to determine win/lose, and send request to server
import { GameManagerService } from '../../../game-manager.service';


import SoundManager from '../../../SoundManager';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { WinnerDialogComponent } from 'src/app/Pages/winner-dialog/winner-dialog.component';


@Component({
  selector: 'app-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.css'],
})
export class GameTableComponent implements OnInit {

  // GameManager:
  gameManager: GameManagerService = new GameManagerService();


  // ViewChild to query Cell 
  @ViewChildren(CellComponent) allCells: QueryList<CellComponent>;

  public opponent: OpponentType;
  public mapsize: MapSize;

  public size: number = 0;

  // Variable to determine the Player's Turn
  private CurrentPlayer: Player = Player.PLAYER_ONE;


  // Make Array 2d represent the state of the map (table).
  // Using CellImp as the class for object
  public GameState: CellImp[][];

  // Initialize an instance of SoundManager to play sound
  public soundPlayer: SoundManager = new SoundManager();


  // Win/Lose Flag:
  public winner: Player = Player.PLAYER_NONE;


  // GameProgress:
  public onGoing: boolean = true;


  //game Dialog


  constructor(
    private activateRouter: ActivatedRoute,
    private location: Location,
    public dialogWinner: MatDialog
  ) {
    // Get values from the url parameters
    this.activateRouter.paramMap.subscribe(params => {
      this.opponent = params.get('opponent') as OpponentType;
      this.mapsize = params.get('size') as MapSize;
      console.log("This Opponent" + this.opponent + this.mapsize);
    })

    // get the size (dimension of game map)
    this.size = this.getMapSize(this.mapsize);
    console.log(this.GameState)

  }


  // Open Dialog
  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.winner;
    // dialogConfig.hasBackdrop = false;

    this.dialogWinner.open(WinnerDialogComponent, dialogConfig)
  }

  // Get the values from params then generate map
  ngOnInit(): void {
    // Create the map 2d GameState
    this.GameState = this.initializeGameState(this.size);
  }




  getMapSize(mapsize: MapSize): number {
    switch (mapsize) {
      case (MapSize.Small): {
        return 8
      }
      case (MapSize.Medium): {
        return 10;
      }
      case (MapSize.Large): {
        return 12;
      }
      case (MapSize.VeryLarge): {
        return 14;
      }
      default: {
        // return based on medium size
        return 6;
      }
    }

  }

  initializeGameState(size: number): CellImp[][] {
    // Initialize GameState
    let newGameState: CellImp[][] = [];
    for (var i: number = 0; i < size; i++) {
      newGameState[i] = [];
      for (var j: number = 0; j < size; j++) {
        newGameState[i][j] = new CellImp(i, j);
      }
    }
    return newGameState;
  }



  selectCell(i: number, j: number) {
    if (this.onGoing == false) {
      return null;
    }


    //console.log("Cell ["+i+","+j+"] has been selected" );
    var selectedCell: CellComponent = this.findCorrectCell(i, j);
    //    console.log(selectedCell)
    // Make the decision



    if (this.CurrentPlayer == Player.PLAYER_ONE && this.GameState[i][j].state == 0) {
      this.GameState[i][j].state = this.CurrentPlayer;
      this.soundPlayer.playRandomSound()
      selectedCell.changeState(this.CurrentPlayer);

      // assert winner
      let newCell: CellImp = new CellImp(i, j);
      newCell.state = this.CurrentPlayer;
      this.winner = this.gameManager.addCell(newCell);


      // Swap Player's turn
      this.CurrentPlayer = Player.PLAYER_TWO;

    } else if (this.CurrentPlayer == Player.PLAYER_TWO && this.GameState[i][j].state == 0) {
      this.GameState[i][j].state = this.CurrentPlayer;
      this.soundPlayer.playRandomSound()
      selectedCell.changeState(this.CurrentPlayer);

      // assert winner
      let newCell: CellImp = new CellImp(i, j);
      newCell.state = this.CurrentPlayer;
      this.winner = this.gameManager.addCell(newCell);

      //Swap Player Turn
      this.CurrentPlayer = Player.PLAYER_ONE;


    } else {
      // Nothing happend
      //console.log("INVALID MOVE");

    }

    if (this.winner == 0) {
      // nothing happend
    } else if (this.winner == 1) {
      // First Player Victory
      this.onGoing = false;
      this.openDialog()
    } else if (this.winner == 2) {
      this.onGoing = false;
      this.openDialog();
    }

  }



  findCorrectCell(i: number, j: number): CellComponent {
    for (var cell of this.allCells.toArray()) {
      if (cell.row == i && cell.column == j) {
        return cell;
      }
    }
    return null;
  }


  ngAfterViewInit() {
    //this.allCells.toArray().forEach(instance => console.log(instance))    
  }

  goBack(): void {
    this.location.back();
    this.soundPlayer.playButtonSound();
  }




}
